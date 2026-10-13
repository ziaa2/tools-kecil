/* =====================================================================
   TOOL: Catet Belanjaan  (v2 — ada saran otomatis dari riwayat)
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
    '.addwrap{max-width:480px;margin:0 auto}' +
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
    '.add:active{transform:scale(.92)}',

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
        '<div class="sugg" id="b-sugg"></div>' +
        '<p class="hint"><button id="b-tp">+ isi harga</button></p>' +
        '<div class="price-row"><input id="b-price" inputmode="numeric" placeholder="Harga satuan (opsional)"></div>' +
        '<div class="addin"><input class="iname" id="b-name" placeholder="Tulis barang…" autocomplete="off" enterkeyhint="done">' +
        '<input class="iqty" id="b-qty" inputmode="numeric" placeholder="Jml" value="1">' +
        '<button class="add" id="b-add" aria-label="Tambah">+</button></div>' +
      '</div></div>';

    var L = function(id){ return root.querySelector('#' + id); };
    var tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    L('b-date').textContent = tanggal;

    function total(){ return items.reduce(function(s, i){ return s + (i.price || 0) * i.qty; }, 0); }

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
      items.forEach(function(i){ if(!i.done) inList[norm(i.name)] = 1; });
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
      var done = items.filter(function(i){ return i.done; }).length;
      L('b-total').textContent = api.rp(total());
      L('b-count').textContent = done + ' / ' + items.length + ' dibeli';
      L('b-prog').style.width = (items.length ? done / items.length * 100 : 0) + '%';
      if(!items.length){
        L('b-list').innerHTML = '<li class="empty"><span class="em">🧺</span>Belum ada catatan.<br>Ketik barang di bawah, lalu tekan +.</li>';
      }else{
        var sorted = items.slice().sort(function(a, b){ return (a.done ? 1 : 0) - (b.done ? 1 : 0); });
        L('b-list').innerHTML = sorted.map(function(i){
          var meta = i.qty + '×' + (i.price ? ' · ' + api.rp(i.price) + ' = ' + api.rp(i.price * i.qty) : '');
          return '<li class="item' + (i.done ? ' done' : '') + (i.id === justAdded ? ' new' : '') + '" data-id="' + i.id + '">' +
            '<button class="chk" data-act="tog" aria-label="Tandai"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>' +
            '<div class="info" data-act="tog"><div class="name">' + api.esc(i.name) + '</div><div class="meta">' + meta + '</div></div>' +
            '<button class="del" data-act="del" aria-label="Hapus">✕</button></li>';
        }).join('');
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
    function push(name, qty, price){
      var it = { id: api.uid(), name: name, qty: qty, price: price || 0, done: false };
      items.unshift(it); justAdded = it.id;
      learn(it);
      L('b-name').value = ''; L('b-qty').value = '1'; L('b-price').value = '';
      commit(); api.buzz(12); L('b-name').focus();
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
      var t = e.target.closest('[data-act]'); if(!t) return;
      var li = t.closest('.item'); if(!li) return;
      var id = li.dataset.id;
      if(t.dataset.act === 'tog'){
        var it = items.find(function(i){ return i.id === id; });
        if(it){ it.done = !it.done; commit(); api.buzz(8); }
      }else{
        var undo = undoable('Barang dihapus');
        li.classList.add('out'); api.buzz(10);
        setTimeout(function(){ items = items.filter(function(i){ return i.id !== id; }); commit(); undo(); }, 180);
      }
    });

    render();

    return {
      /* aksi di menu ⋯ */
      menu: [
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
        get: function(){ return { items: items, history: hist }; },
        set: function(data){
          var its = Array.isArray(data) ? data : (data && data.items);       // format lama (array) tetap bisa dipulihkan
          if(!Array.isArray(its)) throw new Error('format salah');
          items = its;
          if(data && !Array.isArray(data) && data.history && typeof data.history === 'object'){ hist = data.history; hst.set(hist); }
          commit();
        },
        text: function(){
          var lines = ['🛒 Daftar belanja — ' + tanggal, ''];
          items.forEach(function(i){
            lines.push((i.done ? '☑ ' : '☐ ') + i.name + ' ' + i.qty + '×' + (i.price ? ' (' + api.rp(i.price * i.qty) + ')' : ''));
          });
          if(total() > 0){ lines.push('', 'Total estimasi: ' + api.rp(total())); }
          return lines.join('\n');
        }
      }
    };
  }
});
