/* =====================================================================
   TOOL: Link Organize
   Simpan link, kelompokkan per kategori, cari, favoritkan, salin, backup.
   Bisa tempel banyak link sekaligus.
   ===================================================================== */
(function(){
  function parseUrls(s){
    var m = String(s).match(/https?:\/\/[^\s]+/gi);
    if(m) return m;
    var t = String(s).trim();
    if(/^[\w-]+(\.[\w-]+)+(:\d+)?([\/?#]\S*)?$/.test(t)) return ['https://' + t];
    return [];
  }
  function host(u){
    try{ return new URL(u).hostname.replace(/^www\./, ''); }catch(e){ return u; }
  }
  function shortUrl(u){ return u.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''); }
  function hue(s){ var h = 0; for(var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }

  App.registerTool({
    id: 'links',
    icon: '🔖',
    title: 'Link Organize',
    desc: 'Simpan link penting dan kelompokkan per kategori. Bisa tempel banyak link sekaligus, cari, dan favoritkan. Data tersimpan di HP kamu.',

    badge: function(){
      try{
        var n = JSON.parse(localStorage.getItem('toolskecil:links:v1') || '[]').length;
        return n ? n + ' link' : 'kosong';
      }catch(e){ return ''; }
    },

    css: '' +
      '.l-search{margin-bottom:10px}' +
      '.l-search input{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:11px 14px;outline:0;font-size:16px}' +
      '.l-search input:focus{border-color:var(--accent)}' +
      '.l-chips{display:flex;gap:6px;overflow-x:auto;margin:0 0 14px;scrollbar-width:none}' +
      '.l-chips::-webkit-scrollbar{display:none}' +
      '.l-chip{flex:none;padding:8px 13px;border-radius:99px;border:1px solid var(--line);background:var(--surface);color:var(--muted);font-size:14px;white-space:nowrap}' +
      '.l-chip small{margin-left:5px;font-size:11px;opacity:.8}' +
      '.l-chip.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}' +
      '.l-list{display:flex;flex-direction:column;gap:10px}' +
      '.l-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px 8px 6px 12px}' +
      '.l-card.new{animation:lpop .22s ease}' +
      '@keyframes lpop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}' +
      '.l-main{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--text);padding-right:6px}' +
      '.l-av{flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-weight:700;font-size:18px}' +
      '.l-tx{min-width:0;display:flex;flex-direction:column;gap:2px}' +
      '.l-t{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.l-s{font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.l-foot{display:flex;align-items:center;justify-content:space-between;margin-top:6px}' +
      '.l-tag{font-size:12px;color:var(--accent);background:rgba(94,234,212,.1);padding:3px 10px;border-radius:99px;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.l-ac{display:flex;gap:0;margin-left:auto}' +
      '.l-ac button{width:38px;height:36px;border-radius:10px;color:var(--muted);font-size:16px;display:grid;place-items:center}' +
      '.l-ac button:active{background:var(--surface2)}' +
      '.l-ac button.on{color:#fbbf24}' +
      '.l-ac button.d:active{color:var(--danger)}' +
      '.l-ed{display:flex;flex-direction:column;gap:8px;padding:0 4px 4px 0}' +
      '.l-ed input{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:11px 12px;outline:0;font-size:16px}' +
      '.l-ed input:focus{border-color:var(--accent)}' +
      '.l-edact{display:flex;gap:8px;justify-content:flex-end}' +
      '.l-edact button{padding:10px 16px;border-radius:12px;background:var(--surface2);font-size:15px}' +
      '.l-edact .pri{background:var(--accent);color:var(--accent-ink);font-weight:600}' +
      '.l-empty{text-align:center;color:var(--muted);padding:44px 10px;font-size:15px;line-height:1.5}' +
      '.l-empty b{display:block;font-size:38px;margin-bottom:8px;font-weight:400}' +
      '.l-bar{position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line);z-index:5}' +
      '.l-wrap{max-width:560px;margin:0 auto}' +
      '.l-hint{margin:0 0 8px;font-size:12px;color:var(--muted);text-align:center}' +
      '.l-hint button{color:var(--accent);padding:0 2px}' +
      '.l-det{display:none;gap:8px;margin-bottom:8px}' +
      '.l-bar.open .l-det{display:flex}' +
      '.l-det input{flex:1;min-width:0;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:0;font-size:16px}' +
      '.l-det input:focus{border-color:var(--accent)}' +
      '.l-in{display:flex;gap:8px;background:var(--surface2);border:1px solid var(--line);border-radius:18px;padding:6px}' +
      '.l-in:focus-within{border-color:var(--accent)}' +
      '.l-in input{flex:1;min-width:0;background:none;border:0;outline:0;padding:10px 8px;font-size:16px}' +
      '.l-paste{width:42px;height:46px;flex:none;border-radius:12px;font-size:18px;display:grid;place-items:center}' +
      '.l-paste:active{background:var(--surface)}' +
      '.l-add{width:46px;height:46px;flex:none;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:24px;font-weight:600;display:grid;place-items:center}' +
      '.l-add:active{transform:scale(.92)}',

    mount: function(root, api){
      var st = api.store('links');
      var links = st.get([]);          // [{id, url, title, cat, fav, t}]
      var filter = 'all', q = '', editing = null, justAdded = {};
      var tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      root.innerHTML =
        '<div class="l-search" id="l-sw"><input id="l-q" placeholder="Cari link…" autocomplete="off"></div>' +
        '<div class="l-chips" id="l-chips"></div>' +
        '<div class="l-list" id="l-list"></div>' +
        '<div class="l-bar" id="l-bar"><div class="l-wrap">' +
          '<div class="l-det"><input id="l-title" placeholder="Judul (opsional)" autocomplete="off">' +
          '<input id="l-cat" list="l-cats" placeholder="Kategori" autocomplete="off"></div>' +
          '<p class="l-hint"><button id="l-tg">+ judul & kategori</button></p>' +
          '<div class="l-in"><input id="l-url" placeholder="Tempel link (boleh banyak)…" inputmode="url" autocomplete="off" autocapitalize="off">' +
          '<button class="l-paste" id="l-paste" aria-label="Tempel">📋</button>' +
          '<button class="l-add" id="l-add" aria-label="Simpan">+</button></div>' +
        '</div></div>' +
        '<datalist id="l-cats"></datalist>';

      var L = function(id){ return root.querySelector('#' + id); };
      function find(id){ return links.filter(function(x){ return x.id === id; })[0]; }
      function key(c){ return (c || '').trim().toLowerCase(); }

      function categories(){
        var map = {};
        links.forEach(function(l){
          var k = key(l.cat); if(!k) return;
          if(!map[k]) map[k] = { key: k, name: l.cat, n: 0 };
          map[k].n++;
        });
        return Object.keys(map).map(function(k){ return map[k]; })
          .sort(function(a, b){ return (b.n - a.n) || a.name.localeCompare(b.name); });
      }
      function canonCat(c){            // pakai penulisan kategori yang sudah ada
        c = (c || '').trim().replace(/\s+/g, ' ');
        if(!c) return '';
        var hit = categories().filter(function(x){ return x.key === key(c); })[0];
        return hit ? hit.name : c;
      }

      function render(){
        var cats = categories();
        var noneN = links.filter(function(l){ return !key(l.cat); }).length;
        if(filter !== 'all' && filter !== 'none' && !cats.some(function(c){ return 'c:' + c.key === filter; })) filter = 'all';
        if(filter === 'none' && !noneN) filter = 'all';

        L('l-sw').hidden = !links.length;
        L('l-chips').hidden = !links.length;
        L('l-cats').innerHTML = cats.map(function(c){ return '<option value="' + api.esc(c.name) + '">'; }).join('');

        var chips = [{ f: 'all', label: 'Semua', n: links.length }];
        cats.forEach(function(c){ chips.push({ f: 'c:' + c.key, label: c.name, n: c.n }); });
        if(noneN && cats.length) chips.push({ f: 'none', label: 'Lainnya', n: noneN });
        L('l-chips').innerHTML = chips.map(function(c){
          return '<button class="l-chip' + (c.f === filter ? ' on' : '') + '" data-f="' + api.esc(c.f) + '">' + api.esc(c.label) + '<small>' + c.n + '</small></button>';
        }).join('');

        var list = links.filter(function(l){
          if(filter === 'none' && key(l.cat)) return false;
          if(filter.indexOf('c:') === 0 && 'c:' + key(l.cat) !== filter) return false;
          if(q){
            var hay = ((l.title || '') + ' ' + l.url + ' ' + (l.cat || '')).toLowerCase();
            if(hay.indexOf(q) === -1) return false;
          }
          return true;
        }).sort(function(a, b){ return ((b.fav ? 1 : 0) - (a.fav ? 1 : 0)) || (b.t - a.t); });

        var box = L('l-list');
        if(!links.length){
          box.innerHTML = '<div class="l-empty"><b>🔖</b>Belum ada link.<br>Tempel link di bawah, lalu tekan +.</div>';
        }else if(!list.length){
          box.innerHTML = '<div class="l-empty">Tidak ada yang cocok.</div>';
        }else{
          box.innerHTML = list.map(function(l){
            if(l.id === editing){
              return '<div class="l-card" data-id="' + l.id + '"><div class="l-ed">' +
                '<input id="e-title" value="' + api.esc(l.title || '') + '" placeholder="Judul">' +
                '<input id="e-url" value="' + api.esc(l.url) + '" placeholder="Link" inputmode="url" autocapitalize="off">' +
                '<input id="e-cat" list="l-cats" value="' + api.esc(l.cat || '') + '" placeholder="Kategori">' +
                '<div class="l-edact"><button data-act="cancel">Batal</button><button class="pri" data-act="save">Simpan</button></div></div></div>';
            }
            var h = host(l.url), hu = hue(h);
            return '<div class="l-card' + (justAdded[l.id] ? ' new' : '') + '" data-id="' + l.id + '">' +
              '<a class="l-main" href="' + api.esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
                '<span class="l-av" style="background:hsl(' + hu + ',45%,22%);color:hsl(' + hu + ',75%,78%)">' + api.esc(h.charAt(0).toUpperCase()) + '</span>' +
                '<span class="l-tx"><span class="l-t">' + api.esc(l.title || h) + '</span><span class="l-s">' + api.esc(shortUrl(l.url)) + '</span></span></a>' +
              '<div class="l-foot">' + (l.cat ? '<span class="l-tag">' + api.esc(l.cat) + '</span>' : '<span></span>') + '<span class="l-ac">' +
                '<button class="' + (l.fav ? 'on' : '') + '" data-act="fav" aria-label="Favorit">' + (l.fav ? '★' : '☆') + '</button>' +
                '<button data-act="cp" aria-label="Salin link">📋</button>' +
                '<button data-act="edit" aria-label="Edit">✎</button>' +
                '<button class="d" data-act="del" aria-label="Hapus">✕</button></span></div></div>';
          }).join('');
        }
        justAdded = {};
      }
      function commit(){ st.set(links); render(); }

      /* ---------- tambah ---------- */
      function add(){
        var raw = L('l-url').value;
        var urls = parseUrls(raw);
        if(!urls.length){ api.toast(raw.trim() ? 'Link tidak valid' : 'Tempel link dulu'); L('l-url').focus(); return; }
        var have = {};
        links.forEach(function(l){ have[l.url.toLowerCase()] = 1; });
        var fresh = [];
        urls.forEach(function(u){
          var k = u.toLowerCase();
          if(!have[k]){ have[k] = 1; fresh.push(u); }
        });
        if(!fresh.length){ api.toast('Link sudah ada di daftar'); return; }

        var cat = canonCat(L('l-cat').value);
        if(!cat && filter.indexOf('c:') === 0){
          var cur = categories().filter(function(c){ return 'c:' + c.key === filter; })[0];
          if(cur) cat = cur.name;
        }
        var title = fresh.length === 1 ? L('l-title').value.trim() : '';
        var now = Date.now();
        fresh.forEach(function(u, i){
          var it = { id: api.uid(), url: u, title: title, cat: cat, fav: false, t: now + (fresh.length - i) };
          links.push(it); justAdded[it.id] = 1;
        });
        L('l-url').value = ''; L('l-title').value = '';
        commit(); api.buzz(12);
        var skipped = urls.length - fresh.length;
        if(fresh.length > 1 || skipped) api.toast(fresh.length + ' link ditambahkan' + (skipped ? ', ' + skipped + ' sudah ada' : ''));
        L('l-url').focus();
      }
      L('l-add').onclick = add;
      L('l-url').addEventListener('keydown', function(e){ if(e.key === 'Enter') add(); });
      L('l-tg').onclick = function(){
        var bar = L('l-bar'); bar.classList.toggle('open');
        var open = bar.classList.contains('open');
        L('l-tg').textContent = open ? '– sembunyikan judul & kategori' : '+ judul & kategori';
        if(open) L('l-title').focus();
      };
      L('l-paste').onclick = function(){
        if(navigator.clipboard && navigator.clipboard.readText){
          navigator.clipboard.readText().then(function(txt){
            L('l-url').value = (txt || '').trim(); L('l-url').focus();
            if(!(txt || '').trim()) api.toast('Clipboard kosong');
          }, function(){ api.toast('Tidak bisa baca clipboard, tempel manual'); L('l-url').focus(); });
        }else{
          api.toast('Tempel manual di kolom link'); L('l-url').focus();
        }
      };

      L('l-q').addEventListener('input', function(){ q = this.value.trim().toLowerCase(); editing = null; render(); });
      L('l-chips').addEventListener('click', function(e){
        var c = e.target.closest('.l-chip'); if(!c) return;
        filter = c.dataset.f; editing = null; render(); api.buzz(6);
      });

      L('l-list').addEventListener('click', function(e){
        var t = e.target.closest('[data-act]'); if(!t) return;
        var card = t.closest('.l-card'); if(!card) return;
        var id = card.dataset.id, l = find(id), act = t.dataset.act;
        if(!l) return;
        if(act === 'fav'){
          l.fav = !l.fav; commit(); api.buzz(8);
        }else if(act === 'cp'){
          var done = function(){ api.toast('Link tersalin'); };
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(l.url).then(done, function(){ api.toast('Gagal menyalin'); });
          }else{
            var ta = document.createElement('textarea'); ta.value = l.url; document.body.appendChild(ta); ta.select();
            try{ document.execCommand('copy'); done(); }catch(err){ api.toast('Gagal menyalin'); }
            ta.remove();
          }
        }else if(act === 'edit'){
          editing = id; render();
        }else if(act === 'cancel'){
          editing = null; render();
        }else if(act === 'save'){
          var u = parseUrls(L('e-url').value)[0];
          if(!u){ api.toast('Link tidak valid'); return; }
          l.url = u; l.title = L('e-title').value.trim(); l.cat = canonCat(L('e-cat').value);
          editing = null; commit(); api.buzz(8);
        }else if(act === 'del'){
          var snap = JSON.stringify(links);
          links = links.filter(function(x){ return x.id !== id; });
          commit(); api.buzz(10);
          api.toast('Link dihapus', function(){ links = JSON.parse(snap); commit(); });
        }
      });

      render();

      return {
        menu: [
          { label: 'Hapus semua link', danger: true, run: function(){
              if(!links.length) return;
              var snap = JSON.stringify(links);
              links = []; editing = null; filter = 'all'; commit(); api.buzz(20);
              api.toast('Semua link dihapus', function(){ links = JSON.parse(snap); commit(); });
          } }
        ],
        backup: {
          get: function(){ return links; },
          set: function(data){
            if(!Array.isArray(data) || data.some(function(x){ return !x || typeof x.url !== 'string'; })) throw new Error('format salah');
            links = data; editing = null; commit();
          },
          text: function(){
            var groups = {}, order = [];
            links.slice().sort(function(a, b){ return ((b.fav ? 1 : 0) - (a.fav ? 1 : 0)) || (b.t - a.t); }).forEach(function(l){
              var g = l.cat || 'Lainnya';
              if(!groups[g]){ groups[g] = []; order.push(g); }
              groups[g].push('• ' + (l.fav ? '★ ' : '') + (l.title ? l.title + ' — ' : '') + l.url);
            });
            return '🔖 Daftar link — ' + tanggal + '\n\n' + order.map(function(g){ return '📂 ' + g + '\n' + groups[g].join('\n'); }).join('\n\n');
          }
        }
      };
    }
  });
})();
