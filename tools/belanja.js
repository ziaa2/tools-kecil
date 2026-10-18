/* =====================================================================
   TOOL: Catet Belanjaan  (v3 — suara, riwayat, tempel daftar, kategori)
   Satu file = satu tool. Salin file ini sebagai template tool baru.
   ===================================================================== */
App.registerTool({
  id: 'belanja',
  icon: '🛒',
  title: 'Catet Belanjaan',
  desc: 'Catat barang yang mau dibeli hari ini, centang kalau sudah masuk keranjang. Barang yang sering dicatat muncul sebagai saran. Data tersimpan di HP kamu, bisa di-reset kapan saja.',

  /* teks kecil di kartu halaman utama */
  badge: function(){
    try{
      var items = JSON.parse(localStorage.getItem('toolskecil:belanja:v1') || '[]');
      var left = items.filter(function(i){ return !i.done; }).length;
      return items.length ? left + ' belum dibeli' : 'kosong';
    }catch(e){ return ''; }
  },

  /* CSS khusus tool ini (otomatis disuntik) */
  css: '' +
    '.date{color:var(--muted);font-size:12.5px;margin:0 0 12px 4px}' +
    '.summary{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:14px}' +
    '.srow{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}' +
    '.srow .big{font-size:26px;font-weight:650;letter-spacing:-.5px}' +
    '.srow .small{color:var(--muted);font-size:13px}' +
    '.bar{height:6px;background:var(--surface2);border-radius:99px;overflow:hidden}' +
    '.bar i{display:block;height:100%;width:0;background:var(--accent);border-radius:99px;transition:width .3s ease}' +
    '.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}' +
    '.item{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 8px 12px 12px}' +
    '.item.new{animation:pop .22s ease}' +
    '@keyframes pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}' +
    '.item.out{opacity:0;transform:translateX(24px);transition:opacity .18s,transform .18s}' +
    '.chk{width:26px;height:26px;border-radius:9px;border:2px solid #3a424c;flex:none;display:grid;place-items:center}' +
    '.chk svg{width:14px;height:14px;stroke:var(--accent-ink);stroke-width:3;fill:none;opacity:0}' +
    '.item.done .chk{background:var(--accent);border-color:var(--accent)}' +
    '.item.done .chk svg{opacity:1}' +
    '.info{flex:1;min-width:0;text-align:left}' +
    '.name{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.meta{font-size:12.5px;color:var(--muted);margin-top:2px}' +
    '.item.done .name{color:var(--muted);text-decoration:line-through}' +
    '.del{width:36px;height:36px;border-radius:10px;color:var(--muted);font-size:18px;display:grid;place-items:center}' +
    '.del:active{background:var(--surface2);color:var(--danger)}' +
    '.empty{text-align:center;color:var(--muted);padding:44px 10px;font-size:15px;line-height:1.5}' +
    '.empty .em{font-size:38px;display:block;margin-bottom:8px;opacity:.8}' +
    '.addbar{position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line);z-index:5}' +
    '.addwrap{max-width:560px;margin:0 auto}' +
    '.sugg{display:flex;gap:6px;overflow-x:auto;padding:0 0 8px;scrollbar-width:none}' +
    '.sugg::-webkit-scrollbar{display:none}' +
    '.sugg-l{flex:none;align-self:center;color:var(--muted);font-size:12px;padding-right:2px}' +
    '.chip{flex:none;background:var(--surface2);border:1px solid var(--line);border-radius:99px;padding:7px 13px;font-size:14px;white-space:nowrap}' +
    '.chip:active{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}' +
    '.chip small{color:var(--muted);margin-left:5px;font-size:11px}' +
    '.chip:active small{color:var(--accent-ink)}' +
    '.hint{margin:0 0 8px;font-size:12px;color:var(--muted);text-align:center}' +
    '.hint button{color:var(--accent);padding:0 2px}' +
    '.price-row{display:none;margin-bottom:8px}' +
    '.addbar.open .price-row{display:block}' +
    '.price-row input{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:0}' +
    '.addin{display:flex;gap:8px;background:var(--surface2);border:1px solid var(--line);border-radius:18px;padding:6px}' +
    '.addin:focus-within{border-color:var(--accent)}' +
    '.addin input{background:none;border:0;outline:0;padding:10px 8px}' +
    '.iname{flex:1;min-width:0}' +
    '.iqty{width:52px;text-align:center;border-left:1px solid var(--line)!important}' +
    '.add{width:46px;height:46px;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:24px;font-weight:600;display:grid;place-items:center}' +
    '.add:active{transform:scale(.92)}' +
    '.mic{width:46px;height:46px;flex:none;border-radius:14px;display:grid;place-items:center;font-size:20px;background:var(--surface);border:1px solid var(--line)}' +
    '.mic:active{transform:scale(.92)}' +
    '.mic.on{background:#ef4444;border-color:#ef4444;color:#fff;animation:mpulse 1.2s ease-in-out infinite}' +
    '@keyframes mpulse{50%{box-shadow:0 0 0 6px rgba(239,68,68,.25)}}' +
    '.vbox{display:none;margin-bottom:8px;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}' +
    '.addbar.listening .vbox{display:block}' +
    '.vrow{display:flex;align-items:center;gap:8px;font-size:15px}' +
    '.vdot{width:10px;height:10px;border-radius:50%;background:#ef4444;flex:none;animation:vblink 1s ease-in-out infinite}' +
    '@keyframes vblink{50%{opacity:.3}}' +
    '.vhint{color:var(--muted);font-size:12px;margin-top:6px;line-height:1.4}' +
    '.vs-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:30;display:grid;place-items:end center}' +
    '.vs-card{width:100%;max-width:560px;max-height:86vh;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:20px 20px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom,0px))}' +
    '.vs-card h3{margin:0 0 4px;font-size:17px}' +
    '.vs-l{margin:14px 0 6px;font-size:12.5px;color:var(--muted)}' +
    '.vs-o{display:block;width:100%;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:6px}' +
    '.vs-o b{font-weight:600;font-size:15px}' +
    '.vs-o small{display:block;color:var(--muted);font-size:12px;margin-top:2px;line-height:1.35}' +
    '.vs-o.sel{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}' +
    '.vs-row{display:flex;gap:6px}.vs-row .vs-o{flex:1;text-align:center;margin-bottom:0}' +
    '.vs-key{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:0;margin:2px 0 6px}' +
    '.vs-note{font-size:12px;color:var(--muted);line-height:1.45;margin:0 0 4px}' +
    '.vs-ok{width:100%;margin-top:16px;padding:12px;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-weight:600}' +
    '.vs-ok:disabled{opacity:.4}' +
    '.qrow{display:flex;gap:6px;overflow-x:auto;padding:0 0 8px;scrollbar-width:none}' +
    '.qrow::-webkit-scrollbar{display:none}' +
    '.qb{flex:none;background:var(--surface2);border:1px solid var(--line);border-radius:99px;padding:8px 13px;font-size:13px;white-space:nowrap}' +
    '.qb:active{background:var(--surface)}' +
    '.hs-card{display:flex;flex-direction:column;height:min(86vh,720px);overflow:hidden;padding-bottom:0}' +
    '.hs-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}' +
    '.hs-head h3{margin:0}' +
    '.hs-x{width:36px;height:36px;border-radius:10px;color:var(--muted);font-size:18px}' +
    '.hs-tabs{flex:none;display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}' +
    '.hs-tabs::-webkit-scrollbar{display:none}' +
    '.hs-tab{flex:none;background:var(--surface2);border:1px solid var(--line);border-radius:99px;padding:7px 12px;font-size:13px;white-space:nowrap}' +
    '.hs-tab small{opacity:.65;margin-left:5px;font-size:11px}' +
    '.hs-tab.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}' +
    '.hs-body{flex:1;min-height:0;overflow-y:auto;padding-bottom:10px}' +
    '.hs-h{margin:12px 0 6px;font-size:12.5px;color:var(--muted)}.hs-h:first-child{margin-top:2px}' +
    '.hs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
    '.hs-it{text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 11px;min-height:60px;display:flex;flex-direction:column;justify-content:space-between;gap:4px}' +
    '.hs-it b{font-weight:500;font-size:14.5px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}' +
    '.hs-it small{color:var(--muted);font-size:11.5px}' +
    '.hs-it.sel{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}' +
    '.hs-it.ok small{color:var(--accent)}' +
    '.hs-foot{flex:none;border-top:1px solid var(--line);padding:10px 0 calc(12px + env(safe-area-inset-bottom,0px))}' +
    '.hs-sel{display:flex;align-items:center;gap:8px;margin-bottom:8px}' +
    '.hs-sel .nm{flex:1;min-width:0;font-size:15px;font-weight:550;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.hs-sel select{max-width:42%;background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:7px;color:inherit;font-size:12.5px}' +
    '.hs-del{width:36px;height:36px;border-radius:10px;font-size:16px;flex:none}' +
    '.hs-act{display:flex;gap:8px}' +
    '.hs-step{display:flex;align-items:center;gap:6px;flex:none}' +
    '.hs-step button{width:40px;height:44px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-size:20px}' +
    '.hs-step input{width:54px;height:44px;text-align:center;background:var(--surface2);border:1px solid var(--line);border-radius:12px;outline:0;padding:0}' +
    '.hs-add{flex:1;min-width:0;height:44px;border-radius:12px;background:var(--accent);color:var(--accent-ink);font-weight:600}' +
    '.hs-hb{display:flex;gap:2px}' +
    '.item.tt{border-left:3px solid #f59e0b}' +
    '.grp.tt{color:#f59e0b;margin-top:18px}.grp.tt:first-child{margin-top:0}' +
    '.gx{width:30px;height:30px;border-radius:8px;color:var(--muted);font-size:13px;flex:none}' +
    '.gx:active{background:var(--surface2);color:var(--danger)}' +
    '.tt-chips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 4px}' +
    '.hs-sel .nm small{display:block;font-weight:400;color:var(--muted);font-size:11.5px;overflow:hidden;text-overflow:ellipsis}' +
    'select.vs-key{color:inherit;font:inherit}' +
    '.grp{display:flex;align-items:center;gap:8px;margin:8px 2px 0;font-size:12.5px;color:var(--muted);font-weight:550;user-select:none;cursor:pointer}' +
    '.grp:first-child{margin-top:0}' +
    '.grp .gn{flex:1}.grp small{font-weight:400}' +
    '.grp .gc{display:inline-block;transition:transform .15s}.grp.shut .gc{transform:rotate(-90deg)}' +
    '.grp.alldone{opacity:.55}' +
    '.edt{width:36px;height:36px;border-radius:10px;color:var(--muted);font-size:15px;display:grid;place-items:center;flex:none}' +
    '.edt:active{background:var(--surface2);color:var(--accent)}' +
    '.ct-row{display:flex;align-items:center;gap:4px;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:5px 5px 5px 12px;margin-bottom:6px}' +
    '.ct-n{flex:1;min-width:0;font-size:15px}' +
    '.ct-n small{display:block;color:var(--muted);font-size:11.5px}' +
    '.ct-row button{width:38px;height:38px;border-radius:10px;color:var(--muted);font-size:14px;flex:none}' +
    '.ct-row button:disabled{opacity:.25}' +
    '.ct-fixed{opacity:.7}' +
    '.ct-form{background:var(--surface);border:1px solid var(--accent);border-radius:12px;padding:2px 12px 12px;margin:-2px 0 8px}' +
    '.ct-act{display:flex;gap:8px;align-items:center}' +
    '.ct-act .hs-add{height:42px}' +
    '.ct-del{color:var(--danger);padding:0 10px;height:42px;flex:none}' +
    '.ct-sw{display:flex;align-items:center;gap:10px;font-size:14px;margin:8px 0 12px}' +
    '.ct-sw input{width:20px;height:20px;accent-color:var(--accent)}' +
    '.ps-ta{width:100%;min-height:120px;resize:vertical;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:0;font:inherit;line-height:1.5;color:inherit}' +
    '.ps-pv{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}' +
    '.ps-pv li{background:var(--surface2);border:1px solid var(--line);border-radius:99px;padding:5px 11px;font-size:13px}',

  mount: function(root, api){
    var st = api.store('belanja');
    var hst = api.store('belanja-riwayat');
    var items = st.get([]);
    var hist = hst.get({});          // riwayat barang: { kunci: {name, n, qty, price, last} }
    var justAdded = null;

    root.innerHTML =
      '<p class="date" id="b-date"></p>' +
      '<div class="summary"><div class="srow"><div class="big" id="b-total">Rp 0</div><div class="small" id="b-count"></div></div>' +
      '<div class="bar"><i id="b-prog"></i></div></div>' +
      '<ul class="list" id="b-list"></ul>' +
      '<div class="addbar" id="b-addbar"><div class="addwrap">' +
        '<div class="vbox" id="b-voice"><div class="vrow"><span class="vdot"></span><span id="b-vtxt"></span></div>' +
        '<div class="vhint" id="b-vhint"></div></div>' +
        '<div class="sugg" id="b-sugg"></div>' +
        '<div class="qrow"><button class="qb" id="b-hs">📋 Riwayat</button><button class="qb" id="b-ps">📦 Titip belanja</button><button class="qb" id="b-ct">🏷 Kategori</button>' +
        '<button class="qb" id="b-tp">+ isi harga</button><button class="qb" id="b-vs">🎙 ganti suara</button></div>' +
        '<div class="price-row"><input id="b-price" inputmode="numeric" placeholder="Harga satuan (opsional)"></div>' +
        '<div class="addin"><input class="iname" id="b-name" placeholder="Tulis barang…" autocomplete="off" enterkeyhint="done">' +
        '<input class="iqty" id="b-qty" inputmode="numeric" placeholder="Jml" value="1">' +
        '<button class="mic" id="b-mic" aria-label="Bicara">🎤</button>' +
        '<button class="add" id="b-add" aria-label="Tambah">+</button></div>' +
      '</div></div>';

    var L = function(id){ return root.querySelector('#' + id); };
    var tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    L('b-date').textContent = tanggal;

    function sumOf(arr){ return arr.reduce(function(s, i){ return s + (i.price || 0) * i.qty; }, 0); }
    function total(){ return sumOf(items.filter(function(i){ return !i.titip; })); }      // total belanja sendiri (titipan dihitung terpisah)

    /* ---------- riwayat & saran ---------- */
    function norm(s){ return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }

    function learn(it){
      var k = norm(it.name);
      var h = hist[k] || { name: it.name, n: 0 };
      h.name = it.name; h.n += 1; h.qty = it.qty; h.price = it.price || h.price || 0; h.last = Date.now();
      hist[k] = h;
      var keys = Object.keys(hist);
      if(keys.length > 300){      // buang yang paling jarang & paling lama
        keys.sort(function(a, b){ return (hist[a].n - hist[b].n) || (hist[a].last - hist[b].last); });
        keys.slice(0, keys.length - 300).forEach(function(x){ delete hist[x]; });
      }
      hst.set(hist);
    }

    function suggestions(q){
      q = norm(q);
      var inList = {};
      items.forEach(function(i){ if(!i.done && !i.titip) inList[norm(i.name)] = 1; });
      var arr = Object.keys(hist).filter(function(k){ return !inList[k]; }).map(function(k){ return { k: k, h: hist[k], s: 0 }; });
      if(q){
        arr = arr.filter(function(o){
          if(o.k.indexOf(q) === 0){ o.s = 2; return true; }
          if(o.k.split(' ').some(function(w){ return w.indexOf(q) === 0; })){ o.s = 1; return true; }
          return q.length >= 3 && o.k.indexOf(q) > -1;
        });
      }else{
        arr = arr.filter(function(o){ return o.h.n >= 2; });   // kosong: tampilkan yang sering dibeli
      }
      arr.sort(function(a, b){ return (b.s - a.s) || (b.h.n - a.h.n) || (b.h.last - a.h.last); });
      return arr.slice(0, 6).map(function(o){ return o.h; });
    }

    function renderSugg(){
      var q = L('b-name').value;
      var list = suggestions(q);
      if(!list.length){ L('b-sugg').innerHTML = ''; return; }
      L('b-sugg').innerHTML = (q.trim() ? '' : '<span class="sugg-l">Sering:</span>') + list.map(function(h){
        return '<button class="chip" data-k="' + api.esc(norm(h.name)) + '">' + api.esc(h.name) +
          (h.price ? '<small>' + api.rp(h.price) + '</small>' : '') + '</button>';
      }).join('');
    }

    /* ---------- tampilan daftar ---------- */
    function render(){
      var main = items.filter(function(i){ return !i.titip; }), tt = items.filter(function(i){ return i.titip; });
      var isDone = function(i){ return i.done; };
      var done = main.filter(isDone).length, ttDone = tt.filter(isDone).length;
      L('b-total').textContent = api.rp(total());
      L('b-count').textContent = done + ' / ' + main.length + ' dibeli' + (tt.length ? ' · titipan ' + ttDone + '/' + tt.length : '');
      L('b-prog').style.width = (main.length ? done / main.length * 100 : 0) + '%';
      if(!items.length){
        L('b-list').innerHTML = '<li class="empty"><span class="em">🧺</span>Belum ada catatan.<br>Ketik barang di bawah, lalu tekan +.</li>';
      }else{
        var byDone = function(a, b){ return (a.done ? 1 : 0) - (b.done ? 1 : 0); };
        var row = function(i){
          var meta = i.qty + '×' + (i.price ? ' · ' + api.rp(i.price) + ' = ' + api.rp(i.price * i.qty) : '');
          return '<li class="item' + (i.titip ? ' tt' : '') + (i.done ? ' done' : '') + (i.id === justAdded ? ' new' : '') + '" data-id="' + i.id + '">' +
            '<button class="chk" data-act="tog" aria-label="Tandai"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>' +
            '<div class="info" data-act="tog"><div class="name">' + api.esc(i.name) + '</div><div class="meta">' + meta + '</div></div>' +
            '<button class="edt" data-act="edit" aria-label="Ubah">✎</button>' +
            '<button class="del" data-act="del" aria-label="Hapus">✕</button></li>';
        };
        var html = '', sorted = main.slice().sort(byDone);
        if(pref.group){
          var g = {};
          sorted.forEach(function(i){
            var c = itemCat(i); if(CAT_ORDER.indexOf(c) < 0) c = 'Lainnya';
            (g[c] = g[c] || []).push(i);
          });
          CAT_ORDER.forEach(function(c){
            var arr = g[c]; if(!arr) return;
            var dn = arr.filter(isDone).length, shut = !!collapsed[c];
            html += '<li class="grp' + (shut ? ' shut' : '') + (dn === arr.length ? ' alldone' : '') + '" data-g="' + api.esc(c) + '">' +
              '<span class="gc">▾</span><span class="gn">' + api.esc(c) + '</span><small>' + dn + '/' + arr.length + '</small></li>' +
              (shut ? '' : arr.map(row).join(''));
          });
        }else{
          html = sorted.map(row).join('');
        }
        var who = [];
        tt.forEach(function(i){ if(who.indexOf(i.titip) < 0) who.push(i.titip); });
        who.forEach(function(w){
          var arr = tt.filter(function(i){ return i.titip === w; }).sort(byDone);
          var dn = arr.filter(isDone).length, shut = !!collapsed['tt:' + w], sub = sumOf(arr);
          html += '<li class="grp tt' + (shut ? ' shut' : '') + (dn === arr.length ? ' alldone' : '') + '" data-g="' + api.esc('tt:' + w) + '">' +
            '<span class="gc">▾</span><span class="gn">📦 ' + api.esc(w === 'Titipan' ? 'Titipan' : 'Titipan ' + w) + '</span>' +
            '<small>' + dn + '/' + arr.length + (sub ? ' · ' + api.rp(sub) : '') + '</small>' +
            '<button class="gx" data-gdel="' + api.esc(w) + '" aria-label="Hapus ' + api.esc(ttName(w)) + '">✕</button></li>' +
            (shut ? '' : arr.map(row).join(''));
        });
        L('b-list').innerHTML = html;
      }
      justAdded = null;
      renderSugg();
    }
    function commit(){ st.set(items); render(); }
    function undoable(msg){
      var snap = JSON.stringify(items);
      return function(){ api.toast(msg, function(){ items = JSON.parse(snap); commit(); }); };
    }

    /* ---------- tambah barang ---------- */
    function push(name, qty, price, quiet){
      var it = { id: api.uid(), name: name, qty: qty, price: price || 0, done: false };
      items.unshift(it); justAdded = it.id;
      learn(it);
      if(collapsed[itemCat(it)]) collapsed[itemCat(it)] = false;
      if(!quiet){ L('b-name').value = ''; L('b-qty').value = '1'; L('b-price').value = ''; }
      commit(); api.buzz(12); if(!quiet) L('b-name').focus();
    }
    function add(){
      var name = L('b-name').value.trim().replace(/\s+/g, ' ');
      if(!name){ L('b-name').focus(); return; }
      var qty = parseInt(L('b-qty').value, 10); if(!(qty > 0)) qty = 1;
      var price = parseInt((L('b-price').value || '').replace(/\D/g, ''), 10) || 0;
      /* kalau harga tidak diisi tapi barangnya pernah dicatat, pakai harga terakhir */
      if(!price && hist[norm(name)]) price = hist[norm(name)].price || 0;
      push(name, qty, price);
    }
    L('b-add').onclick = add;
    L('b-name').addEventListener('keydown', function(e){ if(e.key === 'Enter') add(); });
    L('b-name').addEventListener('input', renderSugg);
    L('b-tp').onclick = function(){
      var bar = L('b-addbar'); bar.classList.toggle('open');
      var open = bar.classList.contains('open');
      L('b-tp').textContent = open ? '– sembunyikan harga' : '+ isi harga';
      if(open) L('b-price').focus();
    };

    /* ketuk saran = langsung masuk daftar (jumlah & harga terakhir dipakai) */
    L('b-sugg').addEventListener('click', function(e){
      var c = e.target.closest('.chip'); if(!c) return;
      var h = hist[c.dataset.k]; if(!h) return;
      push(h.name, h.qty > 0 ? h.qty : 1, h.price || 0);
    });

    L('b-list').addEventListener('click', function(e){
      var gx = e.target.closest('[data-gdel]');
      if(gx){
        var gw = gx.dataset.gdel;
        if(!window.confirm('Hapus semua ' + ttName(gw) + '?')) return;
        var undoT = undoable('Titipan dihapus');
        items = items.filter(function(i){ return i.titip !== gw; }); commit(); undoT(); return;
      }
      var gh = e.target.closest('.grp');
      if(gh){ var gk = gh.dataset.g; collapsed[gk] = !collapsed[gk]; render(); return; }
      var t = e.target.closest('[data-act]'); if(!t) return;
      var li = t.closest('.item'); if(!li) return;
      var id = li.dataset.id, act = t.dataset.act;
      if(act === 'tog'){
        var it = items.find(function(i){ return i.id === id; });
        if(it){ it.done = !it.done; commit(); api.buzz(8); }
      }else if(act === 'edit'){
        editItem(id);
      }else{
        var undo = undoable('Barang dihapus');
        li.classList.add('out'); api.buzz(10);
        setTimeout(function(){ items = items.filter(function(i){ return i.id !== id; }); commit(); undo(); }, 180);
      }
    });

    /* ---------- input suara (Web Speech API) ---------- */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = null, listening = false, processed = 0, lastResultAt = 0, lastText = '', lastAt = 0;
    var NUMW = { nol: 0, satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10, sebelas: 11 };
    var UNITW = {};
    ('kg kilo kilogram gram gr g ons liter l ml bungkus bks pak botol kaleng butir biji buah pcs lusin sachet saset karung ikat sisir papan dus kardus renteng slop').split(' ').forEach(function(u){ UNITW[u] = true; });

    /* "dua belas" → "12", "setengah" → "½" */
    function numTokens(words){
      var out = [];
      for(var i = 0; i < words.length; i++){
        var w = words[i], n = NUMW[w];
        if(n !== undefined && words[i + 1] === 'belas'){ out.push(String(10 + n)); i++; }
        else if(n !== undefined && words[i + 1] === 'puluh'){ out.push(String(n * 10)); i++; }
        else if(n !== undefined){ out.push(String(n)); }
        else if(w === 'setengah' || w === 'separuh'){ out.push('½'); }
        else out.push(w);
      }
      return out;
    }
    /* satu frasa → {name, qty}. Kalau ada satuan (kilo, botol…), takarannya tetap di nama: "Beras 2 kilo" */
    function parsePhrase(p){
      var w = p.replace(/^\s*(?:tolong\s+)?(?:tambah(?:kan)?|beli(?:kan)?|catat(?:kan)?|masukkan|mau|perlu|butuh)\s+/, '').trim().split(/\s+/).filter(Boolean);
      var t = numTokens(w);
      if(!t.length) return null;
      var hasUnit = t.some(function(x){ return UNITW[x]; });
      var qty = 1;
      if(!hasUnit && t.length > 1){
        if(/^\d{1,2}$/.test(t[0])){ qty = parseInt(t[0], 10); t = t.slice(1); }
        else if(/^\d{1,2}$/.test(t[t.length - 1])){ qty = parseInt(t[t.length - 1], 10); t = t.slice(0, -1); }
      }
      var name = t.join(' ').trim();
      if(!name || /^[\d½]+$/.test(name)) return null;
      return { name: name.charAt(0).toUpperCase() + name.slice(1), qty: qty > 0 ? qty : 1 };
    }
    /* hasil ucapan → beberapa barang (dipisah jeda, koma, "dan", "sama", "lalu", dll.) */
    function handleSpeech(text){
      text = String(text || '').trim();
      if(!text) return;
      var key = text.toLowerCase();
      if(key === lastText && Date.now() - lastAt < 2000) return;       // cegah hasil dobel
      lastText = key; lastAt = Date.now();
      var parts = key.replace(/(\d)[.,](\d)/g, '$1§$2')
        .split(/\s*(?:[,;.]|\bkoma\b|\btitik\b|\blalu\b|\bterus\b|\bdan\b|\bsama\b|\bplus\b)\s*/);
      var snap = JSON.stringify(items), names = [];
      parts.forEach(function(raw){
        var it = parsePhrase(raw.replace(/§/g, ','));
        if(!it) return;
        var k = norm(it.name);
        var ex = items.filter(function(x){ return !x.done && norm(x.name) === k; })[0];
        if(ex){ ex.qty += it.qty; }
        else{ push(it.name, it.qty, (hist[k] && hist[k].price) || 0, true); }
        names.push(it.name);
      });
      if(!names.length) return;
      commit();
      api.toast('Ditambah: ' + names.join(', '), function(){ items = JSON.parse(snap); commit(); });
    }


    /* ---------- pilihan suara (disimpan di HP) ---------- */
    var vst = api.store('belanja-suara');
    var vs = Object.assign({ engine: 'browser', mode: 'sekali', lang: 'id-ID', key: '' }, vst.get({}));
    function saveVs(){ vst.set(vs); }
    var mr = null, chunks = [], stream = null, autoTimer = null, vsOv = null;
    var CONTOH = 'Contoh: “beras dua kilo, telur, minyak goreng”. ';

    function setHint(){
      L('b-vhint').textContent = vs.engine === 'whisper'
        ? CONTOH + 'Ketuk ⏹ kalau sudah selesai. Rekaman dikirim ke Groq untuk diubah jadi teks.'
        : (vs.mode === 'terus' ? 'Sebut beberapa barang, berhenti sendiri kalau diam. ' : 'Sebut barangnya, otomatis berhenti setelah selesai. ') +
          CONTOH + 'Suara diproses lewat layanan browser (Chrome mengirimnya ke Google).';
    }
    function setVoiceUi(on){
      L('b-addbar').classList.toggle('listening', on);
      L('b-mic').classList.toggle('on', on);
      L('b-mic').textContent = on ? '⏹' : '🎤';
      L('b-mic').setAttribute('aria-label', on ? 'Berhenti' : 'Bicara');
    }

    /* --- mesin 1: browser (Web Speech API) --- */
    function startBrowser(){
      if(!SR){ api.toast('Browser ini tidak mendukung pengenalan suara. Coba mesin Whisper di “ganti suara”.'); return; }
      try{
        rec = new SR();
        rec.lang = vs.lang; rec.continuous = (vs.mode === 'terus'); rec.interimResults = true; rec.maxAlternatives = 1;
      }catch(e){ api.toast('Suara tidak bisa dipakai di browser ini'); return; }
      processed = 0; listening = true; lastResultAt = Date.now();
      L('b-vtxt').textContent = 'Mendengarkan… sebutkan barang';
      setHint(); setVoiceUi(true); api.buzz(15);
      rec.onresult = function(e){
        var interim = '', gotFinal = false;
        for(var i = 0; i < e.results.length; i++){
          var r = e.results[i];
          if(r.isFinal){ if(i >= processed){ processed = i + 1; gotFinal = true; handleSpeech(r[0].transcript); } }
          else interim += r[0].transcript;
        }
        lastResultAt = Date.now();
        if(gotFinal && vs.mode === 'sekali'){ listening = false; try{ rec.stop(); }catch(err){} return; }
        L('b-vtxt').textContent = interim.trim() ? '“' + interim.trim() + '”' : 'Mendengarkan… lanjut sebutkan barang';
      };
      rec.onerror = function(e){
        var code = e && e.error;
        var msg = {
          'not-allowed': 'Izin mikrofon ditolak. Aktifkan di pengaturan browser.',
          'service-not-allowed': 'Izin mikrofon ditolak. Aktifkan di pengaturan browser.',
          'audio-capture': 'Mikrofon tidak ditemukan.',
          'network': 'Pengenalan suara butuh koneksi internet.'
        }[code];
        if(msg){ api.toast(msg); stopBrowser(); }
        else if(code === 'no-speech' && vs.mode === 'sekali'){ api.toast('Tidak terdengar, coba lagi'); }
      };
      rec.onend = function(){
        if(!listening || vs.mode === 'sekali'){ listening = false; setVoiceUi(false); return; }
        if(Date.now() - lastResultAt > 12000){ stopBrowser(); return; }      // lama tidak ada suara → berhenti sendiri
        processed = 0;
        try{ rec.start(); }catch(err){ stopBrowser(); }
      };
      try{ rec.start(); }catch(err){ stopBrowser(); api.toast('Mikrofon sedang dipakai, coba lagi'); }
    }
    function stopBrowser(){
      listening = false;
      try{ if(rec) rec.stop(); }catch(e){}
      setVoiceUi(false);
    }

    /* --- mesin 2: Whisper lewat Groq (rekam → kirim → teks) --- */
    function busy(on, txt){
      L('b-addbar').classList.toggle('listening', on);
      if(txt) L('b-vtxt').textContent = txt;
    }
    function startWhisper(){
      if(!vs.key){ api.toast('Isi API key Groq dulu'); openVoiceSettings(); return; }
      if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)){
        api.toast('Perekam suara tidak didukung browser ini'); return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function(s){
        stream = s; chunks = [];
        mr = new MediaRecorder(s);
        mr.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
        mr.onstop = function(){ sendWhisper(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })); };
        mr.start();
        listening = true; L('b-vtxt').textContent = 'Merekam… ketuk ⏹ kalau sudah selesai';
        setHint(); setVoiceUi(true); api.buzz(15);
        autoTimer = setTimeout(function(){ if(listening) stopWhisper(); }, 30000);   // batas 30 detik
      }).catch(function(){ api.toast('Izin mikrofon ditolak. Aktifkan di pengaturan browser.'); });
    }
    function stopWhisper(){
      listening = false; clearTimeout(autoTimer);
      setVoiceUi(false);
      try{ if(mr && mr.state !== 'inactive') mr.stop(); }catch(e){}
      if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; }
    }
    function sendWhisper(blob){
      if(blob.size < 2000){ api.toast('Rekaman terlalu pendek, coba lagi'); return; }
      busy(true, 'Memproses suara…');
      var t = blob.type || '';
      var fd = new FormData();
      fd.append('file', blob, 'suara.' + (t.indexOf('mp4') > -1 ? 'm4a' : t.indexOf('ogg') > -1 ? 'ogg' : 'webm'));
      fd.append('model', 'whisper-large-v3-turbo');
      fd.append('language', vs.lang.slice(0, 2));
      fd.append('temperature', '0');
      fd.append('response_format', 'json');
      fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST', headers: { Authorization: 'Bearer ' + vs.key }, body: fd
      }).then(function(r){
        if(!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function(j){
        busy(false);
        if(j && j.text && j.text.trim()) handleSpeech(j.text); else api.toast('Tidak terdengar, coba lagi');
      }).catch(function(err){
        busy(false);
        var s = String(err && err.message);
        api.toast(s === '401' ? 'API key salah atau kedaluwarsa' : s === '429' ? 'Kuota Groq habis, coba sebentar lagi' : 'Gagal memproses suara. Cek koneksi internet.');
      });
    }

    /* --- pintu masuk yang dipakai tombol mic --- */
    function startVoice(){ if(vs.engine === 'whisper') startWhisper(); else startBrowser(); }
    function stopVoice(){ if(vs.engine === 'whisper') stopWhisper(); else stopBrowser(); }
    if(!SR && !window.MediaRecorder){ L('b-mic').hidden = true; }
    else{ L('b-mic').onclick = function(){ if(listening) stopVoice(); else startVoice(); }; }

    /* --- panel “ganti suara” --- */
    function opt(k, v, title, sub){
      return '<button class="vs-o' + (vs[k] === v ? ' sel' : '') + '" data-k="' + k + '" data-v="' + v + '"><b>' + title + '</b>' +
        (sub ? '<small>' + sub + '</small>' : '') + '</button>';
    }
    function openVoiceSettings(){
      if(listening) stopVoice();
      if(vsOv) return;
      vsOv = document.createElement('div'); vsOv.className = 'vs-ov';
      function draw(){
        vsOv.innerHTML = '<div class="vs-card"><h3>Ganti suara</h3>' +
          '<div class="vs-l">Mesin pengenal suara</div>' +
          opt('engine', 'browser', 'Browser (gratis)', 'Langsung jalan tanpa setup. Akurasi tergantung HP & browser.') +
          opt('engine', 'whisper', 'Whisper via Groq', 'Biasanya lebih akurat untuk bahasa Indonesia. Butuh internet & API key Groq.') +
          (vs.engine === 'whisper'
            ? '<input class="vs-key" id="vs-key" type="password" autocomplete="off" placeholder="API key Groq (gsk_…)" value="' + api.esc(vs.key) + '">' +
              '<p class="vs-note">Key disimpan di HP ini saja dan dikirim langsung ke Groq. Jangan dipakai di HP orang lain.</p>'
            : '<div class="vs-l">Cara bicara</div>' +
              opt('mode', 'sekali', 'Sekali ucap', 'Ketuk 🎤, sebut barang, berhenti otomatis. Paling stabil.') +
              opt('mode', 'terus', 'Terus-menerus', 'Mic tetap menyala untuk banyak barang. Kadang putus sendiri.')) +
          '<div class="vs-l">Bahasa</div>' +
          '<div class="vs-row">' + opt('lang', 'id-ID', 'Indonesia') + opt('lang', 'en-US', 'English') + '</div>' +
          '<button class="vs-ok" data-ok="1">Selesai</button></div>';
      }
      function close(){ if(vsOv){ vsOv.remove(); vsOv = null; setHint(); } }
      vsOv.addEventListener('click', function(e){
        var b = e.target.closest('[data-k]');
        if(b){ vs[b.dataset.k] = b.dataset.v; saveVs(); draw(); return; }
        if(e.target === vsOv || e.target.closest('[data-ok]')) close();
      });
      vsOv.addEventListener('input', function(e){
        if(e.target.id === 'vs-key'){ vs.key = e.target.value.trim(); saveVs(); }
      });
      draw(); root.appendChild(vsOv);
    }
    L('b-vs').onclick = openVoiceSettings;
    setHint();

    /* ---------- riwayat per kategori + tempel daftar ---------- */
    var DEFAULT_CATS = [
      { n: 'Sabun & Kebersihan', w: 'sabun sampo shampo odol gigi sikat detergen rinso sunlight pewangi pelembut molto wipol karbol pel tisu pembalut popok pampers deodoran lotion cukur kapas cuci spons sapu' },
      { n: 'Mie & Makanan Instan', w: 'mie mi indomie supermi sedaap sarimi bihun soun spaghetti makaroni oatmeal bubur sereal kornet sarden nugget sosis instan' },
      { n: 'Kopi, Teh & Minuman', w: 'kopi teh susu sirup coklat cokelat milo energen minuman air galon aqua jus soda sprite fanta cola pocari creamer krimer' },
      { n: 'Snack & Camilan', w: 'snack keripik biskuit roti wafer permen kerupuk chiki cemilan camilan' },
      { n: 'Lauk & Protein', w: 'ayam daging sapi ikan udang tahu tempe telur bakso' },
      { n: 'Sayur & Buah', w: 'sayur bayam kangkung wortel kentang tomat cabai cabe bawang timun jeruk apel pisang jahe kunyit lengkuas buah selada kol sawi brokoli' },
      { n: 'Bumbu & Saus', w: 'kecap saus sambal bumbu santan kaldu royco masako merica terasi penyedap cuka lada ketumbar kemiri' },
      { n: 'Sembako', w: 'beras minyak gula tepung terigu garam maizena sagu' }
    ];
    var kst = api.store('belanja-kategori');
    var ksv = kst.get({});
    var pref = { group: ksv.group !== false };     // daftar dikelompokkan per kategori (bisa dimatikan)
    var collapsed = {};                            // grup yang sedang dilipat di daftar (tidak disimpan)
    var CATS = [], CAT_ORDER = [];
    function rebuildCats(){
      CATS.forEach(function(c){ c.k = String(c.w || '').toLowerCase().split(/[\s,;]+/).filter(Boolean); });
      CAT_ORDER = CATS.map(function(c){ return c.n; }).concat(['Lainnya']);
    }
    function setCats(list){
      CATS = list.map(function(c){ return { n: String(c.n), w: String(c.w || '') }; });
      rebuildCats();
    }
    function saveCats(){
      kst.set({ list: CATS.map(function(c){ return { n: c.n, w: c.w }; }), group: pref.group });
      rebuildCats();
    }
    setCats(Array.isArray(ksv.list) ? ksv.list : DEFAULT_CATS);

    function guessCat(name){
      var words = norm(name).split(/[^a-z0-9]+/).filter(Boolean);
      for(var i = 0; i < CATS.length; i++){
        var ks = CATS[i].k;
        for(var j = 0; j < words.length; j++){
          for(var m = 0; m < ks.length; m++){
            if(words[j] === ks[m] || (ks[m].length >= 4 && words[j].indexOf(ks[m]) === 0)) return CATS[i].n;
          }
        }
      }
      return 'Lainnya';
    }
    function catOf(h){ return (h.cat && CAT_ORDER.indexOf(h.cat) > -1) ? h.cat : guessCat(h.name); }
    function itemCat(i){ var h = hist[norm(i.name)]; return h ? catOf(h) : guessCat(i.name); }
    function setCat(h, c){ if(!c || c === guessCat(h.name)) delete h.cat; else h.cat = c; }
    function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
    function cleanName(t){ return String(t || '').trim().replace(/\s+/g, ' '); }

    /* teks tempelan → [{name, qty}] (baris/koma, buang bullet & nomor, format ekspor “Beras 2×” ikut terbaca) */
    function parsePaste(text){
      var out = [];
      String(text || '').split(/\r?\n/).forEach(function(line){
        line = line.trim();
        if(!line || /^(?:▸|📦)/.test(line) || /^(?:🛒\s*)?daftar belanja\b/i.test(line) || /^total\b/i.test(line)) return;
        line = line.replace(/^(?:[-*•▪◦✔☐☑✅□]\s*|\[[ xX]?\]\s*|\d{1,2}[.)]\s+)+/, '').trim();
        if(!line) return;
        var ex = line.match(/^(.*\S)\s+(\d{1,3})\s*[×x]\s*(?:\(.*\))?$/i);
        if(ex){ out.push({ name: cap(ex[1].trim()), qty: parseInt(ex[2], 10) || 1 }); return; }
        line.replace(/(\d)[.,](\d)/g, '$1§$2').split(/\s*[,;]\s*/).forEach(function(raw){
          var it = parsePhrase(raw.replace(/§/g, ',').toLowerCase());
          if(it) out.push(it);
        });
      });
      return out;
    }
    /* ---------- titip belanja: barang orang lain, dipisah dari belanja sendiri ---------- */
    function ttName(w){ return w === 'Titipan' ? 'titipan' : 'titipan ' + w; }
    function canonWho(w, exceptId){
      w = cleanName(w).slice(0, 24); if(!w) return '';
      for(var i = 0; i < items.length; i++){
        if(items[i].titip && items[i].id !== exceptId && norm(items[i].titip) === norm(w)) return items[i].titip;
      }
      return w;
    }
    /* titipan tidak masuk riwayat/saran & tidak digabung dengan belanja sendiri (hanya dengan titipan orang yang sama) */
    function addTitip(list, who){
      var snap = JSON.stringify(items), n = 0;
      list.forEach(function(it){
        var k = norm(it.name);
        var ex = items.filter(function(x){ return !x.done && x.titip === who && norm(x.name) === k; })[0];
        if(ex){ ex.qty += it.qty; }
        else{
          var h = hist[k];
          items.unshift({ id: api.uid(), name: h ? h.name : it.name, qty: it.qty, price: (h && h.price) || 0, done: false, titip: who });
        }
        n++;
      });
      if(!n) return;
      collapsed['tt:' + who] = false;
      commit(); api.buzz(12);
      api.toast(n + ' barang masuk ke ' + ttName(who), function(){ items = JSON.parse(snap); commit(); });
    }

    var psOv = null, lastTitip = '';
    function openTitip(){
      if(psOv) return;
      if(listening) stopVoice();
      var names = [];
      items.forEach(function(i){ if(i.titip && names.indexOf(i.titip) < 0) names.push(i.titip); });
      psOv = document.createElement('div'); psOv.className = 'vs-ov';
      psOv.innerHTML = '<div class="vs-card"><h3>Titip belanja</h3>' +
        '<p class="vs-note">Barang titipan orang lain ditaruh di bagian sendiri, tidak tercampur dengan belanjaanmu dan tidak masuk riwayat.</p>' +
        '<div class="vs-l">Titipan dari</div>' +
        '<input class="vs-key" id="ps-w" maxlength="24" autocomplete="off" placeholder="Nama, contoh: Ibu (boleh kosong)" value="' + api.esc(lastTitip) + '">' +
        (names.length ? '<div class="tt-chips">' + names.map(function(n){
          return '<button class="chip" data-who="' + api.esc(n) + '">' + api.esc(n) + '</button>';
        }).join('') + '</div>' : '') +
        '<div class="vs-l">Daftar titipan</div>' +
        '<textarea class="ps-ta" id="ps-t" placeholder="Tempel dari WhatsApp, atau ketik satu barang per baris:&#10;beras 2 kilo&#10;telur&#10;minyak goreng, gula 1 kg"></textarea>' +
        '<button class="vs-o" data-clip="1" style="margin-top:8px;text-align:center">📋 Ambil dari clipboard</button>' +
        '<div class="vs-l" id="ps-c">Belum ada barang terbaca</div><ul class="ps-pv" id="ps-pv"></ul>' +
        '<button class="vs-ok" id="ps-go" disabled>Tambahkan titipan</button>' +
        '<button class="vs-o" data-x="1" style="margin-top:8px;text-align:center">Batal</button></div>';
      var T = function(id){ return psOv.querySelector('#' + id); };
      var cur = [];
      function whoNow(){ return canonWho(T('ps-w').value) || 'Titipan'; }
      function preview(){
        cur = parsePaste(T('ps-t').value);
        T('ps-c').textContent = cur.length ? cur.length + ' barang akan masuk ke ' + ttName(whoNow()) : 'Belum ada barang terbaca';
        T('ps-pv').innerHTML = cur.slice(0, 60).map(function(it){
          return '<li>' + api.esc(it.name) + (it.qty > 1 ? ' ×' + it.qty : '') + '</li>';
        }).join('');
        T('ps-go').disabled = !cur.length;
      }
      function close(){ if(psOv){ psOv.remove(); psOv = null; } }
      psOv.addEventListener('input', function(e){ if(e.target.id === 'ps-t' || e.target.id === 'ps-w') preview(); });
      psOv.addEventListener('click', function(e){
        if(e.target === psOv || e.target.closest('[data-x]')){ close(); return; }
        var cw = e.target.closest('[data-who]');
        if(cw){ T('ps-w').value = cw.dataset.who; preview(); return; }
        if(e.target.closest('[data-clip]')){
          try{
            navigator.clipboard.readText().then(function(t){ T('ps-t').value = t; preview(); })
              .catch(function(){ api.toast('Tidak bisa baca clipboard, tempel manual saja'); });
          }catch(err){ api.toast('Tidak bisa baca clipboard, tempel manual saja'); }
          return;
        }
        if(e.target.closest('#ps-go') && cur.length){
          var l = cur, w = whoNow(); lastTitip = cleanName(T('ps-w').value);
          close(); addTitip(l, w);
        }
      });
      root.appendChild(psOv);
      T('ps-t').focus();
    }

    /* --- simpan hasil ubah --- */
    function saveHist(oldKey, v){
      var h = hist[oldKey]; if(!h) return oldKey;
      var nm = cleanName(v.name), nk = norm(nm);
      h.name = nm; h.price = v.price || 0; setCat(h, v.cat);
      if(nk !== oldKey){
        var ex = hist[nk];
        if(ex){ h.n = (h.n || 0) + (ex.n || 0); h.last = Math.max(h.last || 0, ex.last || 0); }
        hist[nk] = h; delete hist[oldKey];
        items.forEach(function(i){ if(!i.done && !i.titip && norm(i.name) === oldKey) i.name = nm; });
        st.set(items);
      }
      hst.set(hist); render();
      return nk;
    }
    function saveItem(id, v){
      var it = items.find(function(i){ return i.id === id; }); if(!it) return;
      var snap = JSON.stringify(items), nm = cleanName(v.name);
      it.name = nm; it.qty = v.qty > 0 ? v.qty : 1; it.price = v.price || 0;
      if(it.titip){                      // titipan tidak masuk riwayat/kategori
        it.titip = canonWho(v.who, id) || it.titip; commit();
        api.toast('Barang diubah', function(){ items = JSON.parse(snap); commit(); });
        return;
      }
      var k = norm(nm), h = hist[k];
      if(!h){ h = hist[k] = { name: nm, n: 1, qty: it.qty, price: it.price, last: Date.now() }; }
      else{ h.name = nm; if(it.price) h.price = it.price; }
      setCat(h, v.cat); hst.set(hist); commit();
      api.toast('Barang diubah', function(){ items = JSON.parse(snap); commit(); });
    }
    function editItem(id){
      var it = items.find(function(i){ return i.id === id; }); if(!it) return;
      openEdit({ title: it.titip ? 'Ubah barang titipan' : 'Ubah barang', name: it.name, qty: it.qty, price: it.price, cat: it.titip ? null : itemCat(it), nocat: !!it.titip, who: it.titip || null, onSave: function(v){ saveItem(id, v); } });
    }

    /* --- sheet ubah barang (nama, jumlah, harga, kategori) --- */
    var edOv = null;
    function openEdit(spec){
      if(edOv) return;
      var cur = CAT_ORDER.indexOf(spec.cat) > -1 ? spec.cat : 'Lainnya';
      edOv = document.createElement('div'); edOv.className = 'vs-ov';
      edOv.innerHTML = '<div class="vs-card"><h3>' + api.esc(spec.title) + '</h3>' +
        '<div class="vs-l">Nama barang</div><input class="vs-key" id="ed-n" value="' + api.esc(spec.name) + '" autocomplete="off">' +
        (spec.qty != null ? '<div class="vs-l">Jumlah</div><input class="vs-key" id="ed-q" inputmode="numeric" value="' + spec.qty + '">' : '') +
        '<div class="vs-l">Harga satuan (opsional)</div><input class="vs-key" id="ed-p" inputmode="numeric" placeholder="0" value="' + (spec.price || '') + '">' +
        (spec.nocat ? '' : '<div class="vs-l">Kategori</div><select class="vs-key" id="ed-c">' + CAT_ORDER.map(function(n){
          return '<option' + (n === cur ? ' selected' : '') + '>' + api.esc(n) + '</option>';
        }).join('') + '</select>') +
        (spec.who != null ? '<div class="vs-l">Titipan dari</div><input class="vs-key" id="ed-w" maxlength="24" autocomplete="off" value="' + api.esc(spec.who) + '">' : '') +
        '<button class="vs-ok" data-save="1">Simpan</button>' +
        '<button class="vs-o" data-x="1" style="margin-top:8px;text-align:center">Batal</button></div>';
      var E = function(id){ return edOv.querySelector('#' + id); };
      function close(){ if(edOv){ edOv.remove(); edOv = null; } }
      edOv.addEventListener('click', function(e){
        if(e.target === edOv || e.target.closest('[data-x]')){ close(); return; }
        if(e.target.closest('[data-save]')){
          var nm = cleanName(E('ed-n').value);
          if(!nm){ api.toast('Nama tidak boleh kosong'); return; }
          var qty = null;
          if(spec.qty != null){ qty = parseInt(E('ed-q').value, 10); if(!(qty > 0)) qty = 1; }
          var price = parseInt(String(E('ed-p').value).replace(/\D/g, ''), 10) || 0;
          var v = { name: nm, qty: qty, price: price, cat: spec.nocat ? null : E('ed-c').value, who: spec.who != null ? cleanName(E('ed-w').value) : null };
          close(); spec.onSave(v);
        }
      });
      root.appendChild(edOv);
    }

    /* --- panel Kelola kategori: tambah, ubah, hapus, urutkan --- */
    var ctOv = null, hsRefresh = null;
    function openCats(){
      if(ctOv) return;
      var ed = null;                      // null | 'new' | indeks kategori yang sedang diubah
      ctOv = document.createElement('div'); ctOv.className = 'vs-ov';
      function counts(){
        var c = {};
        Object.keys(hist).forEach(function(k){ var n = catOf(hist[k]); c[n] = (c[n] || 0) + 1; });
        return c;
      }
      function problem(n, idx){
        if(!n) return 'Nama kategori tidak boleh kosong';
        if(norm(n) === 'lainnya') return '“Lainnya” sudah ada otomatis';
        for(var i = 0; i < CATS.length; i++){ if(i !== idx && norm(CATS[i].n) === norm(n)) return 'Nama kategori sudah dipakai'; }
        return '';
      }
      function form(c, i){
        return '<div class="ct-form"><div class="vs-l">Nama kategori</div>' +
          '<input class="vs-key" id="ct-n" maxlength="30" autocomplete="off" value="' + api.esc(c.n) + '">' +
          '<div class="vs-l">Kata kunci (pisahkan dengan koma atau spasi)</div>' +
          '<textarea class="ps-ta" id="ct-w" style="min-height:64px" placeholder="contoh: kopi teh susu">' + api.esc(c.w) + '</textarea>' +
          '<p class="vs-note">Barang yang namanya diawali kata kunci ini otomatis masuk kategori ini.</p>' +
          '<div class="ct-act"><button class="hs-add" data-save="1">Simpan</button>' +
          (i >= 0 ? '<button class="ct-del" data-del="' + i + '">Hapus</button>' : '') +
          '<button class="ct-del" style="color:var(--muted)" data-cancel="1">Batal</button></div></div>';
      }
      function draw(){
        var old = ctOv.querySelector('.vs-card'), top = old ? old.scrollTop : 0, cnt = counts();
        var html = '<div class="vs-card"><div class="hs-head"><h3>Kategori</h3><button class="hs-x" data-ok="1" aria-label="Tutup">✕</button></div>' +
          '<p class="vs-note">Urutan di sini dipakai di daftar belanja dan riwayat. Susun sesuai urutan rak di toko.</p>' +
          '<label class="ct-sw"><input type="checkbox" id="ct-g"' + (pref.group ? ' checked' : '') + '> Kelompokkan daftar belanja per kategori</label>';
        CATS.forEach(function(c, i){
          html += '<div class="ct-row"><div class="ct-n">' + api.esc(c.n) + '<small>' + (cnt[c.n] || 0) + ' barang</small></div>' +
            '<button data-up="' + i + '" aria-label="Naik"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
            '<button data-dn="' + i + '" aria-label="Turun"' + (i === CATS.length - 1 ? ' disabled' : '') + '>▼</button>' +
            '<button data-ed="' + i + '" aria-label="Ubah">✎</button></div>' + (ed === i ? form(c, i) : '');
        });
        html += '<div class="ct-row ct-fixed"><div class="ct-n">Lainnya<small>' + (cnt['Lainnya'] || 0) + ' barang · selalu ada</small></div></div>';
        html += ed === 'new' ? form({ n: '', w: '' }, -1) : '<button class="vs-o" data-new="1" style="text-align:center;margin-top:8px">＋ Tambah kategori</button>';
        html += '<button class="vs-o" data-reset="1" style="text-align:center;margin-top:6px;color:var(--danger)">Kembalikan kategori bawaan</button>' +
          '<button class="vs-ok" data-ok="1">Selesai</button></div>';
        ctOv.innerHTML = html;
        ctOv.querySelector('.vs-card').scrollTop = top;
      }
      function changed(){ saveCats(); hst.set(hist); render(); if(hsRefresh) hsRefresh(); draw(); }
      function close(){ if(ctOv){ ctOv.remove(); ctOv = null; } }
      ctOv.addEventListener('change', function(e){
        if(e.target.id === 'ct-g'){ pref.group = !!e.target.checked; saveCats(); render(); }
      });
      ctOv.addEventListener('click', function(e){
        var T = e.target;
        if(T === ctOv || T.closest('[data-ok]')){ close(); return; }
        var b;
        if((b = T.closest('[data-up]'))){ var u = parseInt(b.dataset.up, 10); if(u > 0){ var x = CATS[u]; CATS[u] = CATS[u - 1]; CATS[u - 1] = x; ed = null; changed(); } return; }
        if((b = T.closest('[data-dn]'))){ var d = parseInt(b.dataset.dn, 10); if(d < CATS.length - 1){ var y = CATS[d]; CATS[d] = CATS[d + 1]; CATS[d + 1] = y; ed = null; changed(); } return; }
        if((b = T.closest('[data-ed]'))){ var n = parseInt(b.dataset.ed, 10); ed = (ed === n) ? null : n; draw(); return; }
        if(T.closest('[data-new]')){ ed = 'new'; draw(); return; }
        if(T.closest('[data-cancel]')){ ed = null; draw(); return; }
        if(T.closest('[data-save]')){
          var nm = cleanName(ctOv.querySelector('#ct-n').value), w = ctOv.querySelector('#ct-w').value.trim();
          var idx = ed === 'new' ? -1 : ed, msg = problem(nm, idx);
          if(msg){ api.toast(msg); return; }
          if(ed === 'new'){ CATS.push({ n: nm, w: w }); }
          else{
            var oldN = CATS[idx].n; CATS[idx].n = nm; CATS[idx].w = w;
            if(oldN !== nm) Object.keys(hist).forEach(function(k){ if(hist[k].cat === oldN) hist[k].cat = nm; });
          }
          ed = null; changed(); return;
        }
        if((b = T.closest('[data-del]'))){
          var di = parseInt(b.dataset.del, 10), dn = CATS[di] && CATS[di].n; if(dn == null) return;
          if(!window.confirm('Hapus kategori “' + dn + '”? Barangnya dipindah otomatis ke kategori lain atau Lainnya.')) return;
          Object.keys(hist).forEach(function(k){ if(hist[k].cat === dn) delete hist[k].cat; });
          CATS.splice(di, 1); ed = null; changed(); return;
        }
        if(T.closest('[data-reset]')){
          if(!window.confirm('Kembalikan semua kategori ke bawaan? Kategori buatanmu akan hilang.')) return;
          setCats(DEFAULT_CATS); ed = null; changed();
        }
      });
      root.appendChild(ctOv);
      draw();
    }

    /* --- panel Riwayat: tab kategori + kartu 2 kolom + bar tambah di bawah --- */
    var hsOv = null;
    function openHistory(){
      if(hsOv) return;
      if(listening) stopVoice();
      var q = '', tab = 'all', sel = null, oq = 1, added = {};
      hsOv = document.createElement('div'); hsOv.className = 'vs-ov';
      hsOv.innerHTML = '<div class="vs-card hs-card">' +
        '<div class="hs-head"><h3>Riwayat barang</h3><div class="hs-hb">' +
        '<button class="hs-x" data-cat="1" aria-label="Kelola kategori">🏷</button><button class="hs-x" data-ok="1" aria-label="Tutup">✕</button></div></div>' +
        '<input class="vs-key" id="hs-q" placeholder="Cari barang…" autocomplete="off">' +
        '<div class="hs-tabs" id="hs-tabs"></div><div class="hs-body" id="hs-body"></div><div class="hs-foot" id="hs-foot"></div></div>';
      var H = function(id){ return hsOv.querySelector('#' + id); };
      function readQty(){ var f = H('hs-qty'); if(f){ var v = parseInt(f.value, 10); oq = v > 0 ? v : 1; } }
      function groupsOf(keys){
        var g = {};
        keys.forEach(function(k){
          var c = catOf(hist[k]); if(CAT_ORDER.indexOf(c) < 0) c = 'Lainnya';
          (g[c] = g[c] || []).push(k);
        });
        CAT_ORDER.forEach(function(c){
          if(g[c]) g[c].sort(function(a, b){ return (hist[b].n - hist[a].n) || (hist[b].last - hist[a].last); });
        });
        return g;
      }
      function card(k, inList){
        var h = hist[k];
        var meta = added[k] ? '✓ masuk ×' + added[k] : inList[k] ? 'di daftar ×' + inList[k] : h.n + '×' + (h.price ? ' · ' + api.rp(h.price) : '');
        return '<button class="hs-it' + (sel === k ? ' sel' : '') + (added[k] ? ' ok' : '') + '" data-t="' + api.esc(k) + '">' +
          '<b>' + api.esc(h.name) + '</b><small>' + meta + '</small></button>';
      }
      function drawBody(){
        var nq = norm(q);
        var keys = Object.keys(hist).filter(function(k){ return !nq || k.indexOf(nq) > -1; });
        var g = groupsOf(keys);
        if(tab !== 'all' && !g[tab]) tab = 'all';
        var inList = {};
        items.forEach(function(i){ if(!i.done && !i.titip) inList[norm(i.name)] = i.qty; });
        var tabsEl = H('hs-tabs'), tl = tabsEl.scrollLeft;
        var tabs = '<button class="hs-tab' + (tab === 'all' ? ' on' : '') + '" data-tab="all">Semua<small>' + keys.length + '</small></button>';
        CAT_ORDER.forEach(function(c){
          if(g[c]) tabs += '<button class="hs-tab' + (tab === c ? ' on' : '') + '" data-tab="' + api.esc(c) + '">' + api.esc(c) + '<small>' + g[c].length + '</small></button>';
        });
        tabsEl.innerHTML = tabs; tabsEl.scrollLeft = tl;
        var html = '';
        CAT_ORDER.forEach(function(c){
          if(!g[c] || (tab !== 'all' && tab !== c)) return;
          if(tab === 'all') html += '<div class="hs-h">' + api.esc(c) + '</div>';
          html += '<div class="hs-grid">' + g[c].map(function(k){ return card(k, inList); }).join('') + '</div>';
        });
        if(!html) html = '<div class="empty"><span class="em">🗂️</span>' + (Object.keys(hist).length ? 'Tidak ada barang yang cocok.' : 'Riwayat masih kosong.<br>Barang yang pernah dicatat akan muncul di sini.') + '</div>';
        var body = H('hs-body'), top = body.scrollTop;
        body.innerHTML = html; body.scrollTop = top;
      }
      function drawFoot(){
        var h = sel && hist[sel];
        if(!h){
          sel = null;
          H('hs-foot').innerHTML = '<p class="vs-note" style="margin:0 0 8px;text-align:center">Ketuk barang untuk menambah ke daftar</p>' +
            '<button class="vs-ok" data-ok="1" style="margin:0">Selesai</button>';
          return;
        }
        H('hs-foot').innerHTML = '<div class="hs-sel"><div class="nm">' + api.esc(h.name) +
          '<small>' + api.esc(catOf(h)) + (h.price ? ' · ' + api.rp(h.price) : '') + '</small></div>' +
          '<button class="hs-del" data-edit="1" aria-label="Ubah nama, harga, kategori">✎</button>' +
          '<button class="hs-del" data-del="1" aria-label="Hapus dari riwayat">🗑</button></div>' +
          '<div class="hs-act"><div class="hs-step"><button data-s="-1" aria-label="Kurang">−</button>' +
          '<input id="hs-qty" inputmode="numeric" value="' + oq + '" onfocus="this.select()"><button data-s="1" aria-label="Tambah">+</button></div>' +
          '<button class="hs-add" data-add="1">Tambah ke daftar</button></div>';
      }
      function close(){ if(hsOv){ hsOv.remove(); hsOv = null; hsRefresh = null; } }
      hsOv.addEventListener('input', function(e){
        if(e.target.id === 'hs-q'){ q = e.target.value; sel = null; drawBody(); drawFoot(); }
      });
      hsOv.addEventListener('click', function(e){
        if(e.target === hsOv || e.target.closest('[data-ok]')){ close(); return; }
        if(e.target.closest('[data-cat]')){ openCats(); return; }
        var tb = e.target.closest('[data-tab]');
        if(tb){ tab = tb.dataset.tab; drawBody(); return; }
        var t = e.target.closest('[data-t]');
        if(t){
          var k = t.dataset.t;
          if(sel === k) sel = null;
          else{ sel = k; oq = hist[k] && hist[k].qty > 0 ? hist[k].qty : 1; }
          drawBody(); drawFoot(); return;
        }
        var sb = e.target.closest('[data-s]');
        if(sb){ readQty(); oq = Math.max(1, oq + parseInt(sb.dataset.s, 10)); drawFoot(); return; }
        if(e.target.closest('[data-edit]') && sel && hist[sel]){
          var h0 = hist[sel], k0 = sel;
          openEdit({ title: 'Ubah barang di riwayat', name: h0.name, qty: null, price: h0.price || 0, cat: catOf(h0), onSave: function(v){
            var nk = saveHist(k0, v); if(sel === k0) sel = nk; drawBody(); drawFoot();
          } });
          return;
        }
        if(e.target.closest('[data-add]') && sel && hist[sel]){
          readQty();
          var h = hist[sel], k2 = sel, ex = items.filter(function(x){ return !x.done && !x.titip && norm(x.name) === k2; })[0];
          if(ex){ ex.qty += oq; commit(); }
          else{ push(h.name, oq, h.price || 0, true); }
          added[k2] = (added[k2] || 0) + oq;
          sel = null; api.buzz(12); drawBody(); drawFoot(); return;
        }
        if(e.target.closest('[data-del]') && sel && hist[sel]){
          if(!window.confirm('Hapus “' + hist[sel].name + '” dari riwayat?')) return;
          delete hist[sel]; hst.set(hist); sel = null; renderSugg(); drawBody(); drawFoot();
        }
      });
      root.appendChild(hsOv);
      hsRefresh = function(){ drawBody(); drawFoot(); };
      drawBody(); drawFoot();
    }
    L('b-hs').onclick = openHistory;
    L('b-ps').onclick = openTitip;
    L('b-ct').onclick = openCats;

    /* ruang kosong di bawah daftar = tinggi bar input (otomatis ikut berubah) */
    var addbar = L('b-addbar'), ro = null;
    function fitPad(){ L('b-list').style.paddingBottom = (addbar.offsetHeight + 24) + 'px'; }
    if(window.ResizeObserver){ ro = new ResizeObserver(fitPad); ro.observe(addbar); }
    window.addEventListener('resize', fitPad);
    fitPad();

    render();

    return {
      destroy: function(){ if(ro) ro.disconnect(); window.removeEventListener('resize', fitPad); if(listening) stopVoice(); [vsOv, hsOv, psOv, edOv, ctOv].forEach(function(o){ if(o) o.remove(); }); vsOv = hsOv = psOv = edOv = ctOv = null; },
      /* aksi di menu ⋯ */
      menu: [
        { label: 'Riwayat barang', run: openHistory },
        { label: 'Titip belanja', run: openTitip },
        { label: 'Kelola kategori', run: openCats },
        { label: 'Ganti suara', run: openVoiceSettings },
        { label: 'Hapus yang sudah dibeli', run: function(){ var u = undoable('Yang sudah dibeli dihapus'); items = items.filter(function(i){ return !i.done; }); commit(); u(); } },
        { label: 'Kosongkan semua centang', run: function(){ var u = undoable('Centang dikosongkan'); items.forEach(function(i){ i.done = false; }); commit(); u(); } },
        { label: 'Reset semua daftar', danger: true, run: function(){ if(!items.length) return; var u = undoable('Daftar di-reset'); items = []; commit(); api.buzz(20); u(); } },
        { label: 'Hapus riwayat saran', danger: true, run: function(){
            var snap = JSON.stringify(hist);
            hist = {}; hst.set(hist); renderSugg();
            api.toast('Riwayat saran dihapus', function(){ hist = JSON.parse(snap); hst.set(hist); renderSugg(); });
        } }
      ],
      /* backup: dipakai menu Download / WhatsApp / Pulihkan */
      backup: {
        get: function(){ return { items: items, history: hist, cats: { list: CATS.map(function(c){ return { n: c.n, w: c.w }; }), group: pref.group } }; },
        set: function(data){
          var its = Array.isArray(data) ? data : (data && data.items);       // format lama (array) tetap bisa dipulihkan
          if(!Array.isArray(its)) throw new Error('format salah');
          items = its;
          if(data && !Array.isArray(data) && data.history && typeof data.history === 'object'){ hist = data.history; hst.set(hist); }
          if(data && data.cats && Array.isArray(data.cats.list)){ setCats(data.cats.list); pref.group = data.cats.group !== false; saveCats(); }
          commit();
        },
        text: function(){
          var lines = ['🛒 Daftar belanja — ' + tanggal, ''];
          var fmt = function(i){ return (i.done ? '☑ ' : '☐ ') + i.name + ' ' + i.qty + '×' + (i.price ? ' (' + api.rp(i.price * i.qty) + ')' : ''); };
          var main = items.filter(function(i){ return !i.titip; });
          if(pref.group){
            var g = {};
            main.forEach(function(i){ var c = itemCat(i); if(CAT_ORDER.indexOf(c) < 0) c = 'Lainnya'; (g[c] = g[c] || []).push(i); });
            CAT_ORDER.forEach(function(c){
              if(!g[c]) return;
              lines.push('▸ ' + c);
              g[c].forEach(function(i){ lines.push(fmt(i)); });
              lines.push('');
            });
          }else{
            main.forEach(function(i){ lines.push(fmt(i)); });
          }
          var who = [];
          items.forEach(function(i){ if(i.titip && who.indexOf(i.titip) < 0) who.push(i.titip); });
          who.forEach(function(w){
            var arr = items.filter(function(i){ return i.titip === w; }), sub = sumOf(arr);
            if(lines[lines.length - 1] !== '') lines.push('');
            lines.push('📦 ' + (w === 'Titipan' ? 'Titipan' : 'Titipan ' + w) + (sub ? ' — ' + api.rp(sub) : ''));
            arr.forEach(function(i){ lines.push(fmt(i)); });
          });
          if(total() > 0){
            if(lines[lines.length - 1] !== '') lines.push('');
            lines.push('Total estimasi' + (who.length ? ' (belanja sendiri)' : '') + ': ' + api.rp(total()));
          }
          return lines.join('\n');
        }
      }
    };
  }
});
