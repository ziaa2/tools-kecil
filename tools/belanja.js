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
        '<div class="qrow"><button class="qb" id="b-hs">📋 Riwayat</button><button class="qb" id="b-ps">📥 Tempel daftar</button>' +
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
    function push(name, qty, price, quiet){
      var it = { id: api.uid(), name: name, qty: qty, price: price || 0, done: false };
      items.unshift(it); justAdded = it.id;
      learn(it);
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
    var CATS = [
      { n: 'Sabun & Kebersihan', w: 'sabun sampo shampo odol gigi sikat detergen rinso sunlight pewangi pelembut molto wipol karbol pel tisu pembalut popok pampers deodoran lotion cukur kapas cuci spons sapu' },
      { n: 'Mie & Makanan Instan', w: 'mie mi indomie supermi sedaap sarimi bihun soun spaghetti makaroni oatmeal bubur sereal kornet sarden nugget sosis instan' },
      { n: 'Kopi, Teh & Minuman', w: 'kopi teh susu sirup coklat cokelat milo energen minuman air galon aqua jus soda sprite fanta cola pocari creamer krimer' },
      { n: 'Snack & Camilan', w: 'snack keripik biskuit roti wafer permen kerupuk chiki cemilan camilan' },
      { n: 'Lauk & Protein', w: 'ayam daging sapi ikan udang tahu tempe telur bakso' },
      { n: 'Sayur & Buah', w: 'sayur bayam kangkung wortel kentang tomat cabai cabe bawang timun jeruk apel pisang jahe kunyit lengkuas buah selada kol sawi brokoli' },
      { n: 'Bumbu & Saus', w: 'kecap saus sambal bumbu santan kaldu royco masako merica terasi penyedap cuka lada ketumbar kemiri' },
      { n: 'Sembako', w: 'beras minyak gula tepung terigu garam maizena sagu' }
    ];
    CATS.forEach(function(c){ c.k = c.w.split(' '); });
    var CAT_ORDER = CATS.map(function(c){ return c.n; }).concat(['Lainnya']);

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
    function catOf(h){ return h.cat || guessCat(h.name); }
    function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }

    /* teks tempelan → [{name, qty}] (baris/koma, buang bullet & nomor, format ekspor “Beras 2×” ikut terbaca) */
    function parsePaste(text){
      var out = [];
      String(text || '').split(/\r?\n/).forEach(function(line){
        line = line.trim();
        if(!line || /^(?:🛒\s*)?daftar belanja\b/i.test(line) || /^total\b/i.test(line)) return;
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
    /* masukkan banyak barang sekaligus (barang yang sama & belum dicentang → jumlah ditambah) */
    function addParsed(list){
      var snap = JSON.stringify(items), n = 0;
      list.forEach(function(it){
        var k = norm(it.name);
        var ex = items.filter(function(x){ return !x.done && norm(x.name) === k; })[0];
        if(ex){ ex.qty += it.qty; }
        else{ push(hist[k] ? hist[k].name : it.name, it.qty, (hist[k] && hist[k].price) || 0, true); }
        n++;
      });
      if(!n) return;
      commit();
      api.toast('Ditambah ' + n + ' barang', function(){ items = JSON.parse(snap); commit(); });
    }

    /* --- panel Tempel daftar --- */
    var psOv = null;
    function openPaste(){
      if(psOv) return;
      if(listening) stopVoice();
      psOv = document.createElement('div'); psOv.className = 'vs-ov';
      psOv.innerHTML = '<div class="vs-card"><h3>Tempel daftar</h3>' +
        '<p class="vs-note">Tempel dari WhatsApp atau catatan. Satu barang per baris, atau dipisah koma.</p>' +
        '<textarea class="ps-ta" id="ps-t" placeholder="Contoh:&#10;beras 2 kilo&#10;telur&#10;minyak goreng, gula 1 kg"></textarea>' +
        '<button class="vs-o" data-clip="1" style="margin-top:8px;text-align:center">📋 Ambil dari clipboard</button>' +
        '<div class="vs-l" id="ps-c">Belum ada barang terbaca</div><ul class="ps-pv" id="ps-pv"></ul>' +
        '<button class="vs-ok" id="ps-go" disabled>Tambahkan</button>' +
        '<button class="vs-o" data-x="1" style="margin-top:8px;text-align:center">Batal</button></div>';
      var T = function(id){ return psOv.querySelector('#' + id); };
      var cur = [];
      function preview(){
        cur = parsePaste(T('ps-t').value);
        T('ps-c').textContent = cur.length ? cur.length + ' barang akan ditambahkan' : 'Belum ada barang terbaca';
        T('ps-pv').innerHTML = cur.slice(0, 60).map(function(it){
          return '<li>' + api.esc(it.name) + (it.qty > 1 ? ' ×' + it.qty : '') + '</li>';
        }).join('');
        T('ps-go').disabled = !cur.length;
      }
      function close(){ if(psOv){ psOv.remove(); psOv = null; } }
      psOv.addEventListener('input', function(e){ if(e.target.id === 'ps-t') preview(); });
      psOv.addEventListener('click', function(e){
        if(e.target === psOv || e.target.closest('[data-x]')){ close(); return; }
        if(e.target.closest('[data-clip]')){
          try{
            navigator.clipboard.readText().then(function(t){ T('ps-t').value = t; preview(); })
              .catch(function(){ api.toast('Tidak bisa baca clipboard, tempel manual saja'); });
          }catch(err){ api.toast('Tidak bisa baca clipboard, tempel manual saja'); }
          return;
        }
        if(e.target.closest('#ps-go') && cur.length){ var l = cur; close(); addParsed(l); }
      });
      root.appendChild(psOv);
      T('ps-t').focus();
    }

    /* --- panel Riwayat: tab kategori + kartu 2 kolom + bar tambah di bawah --- */
    var hsOv = null;
    function openHistory(){
      if(hsOv) return;
      if(listening) stopVoice();
      var q = '', tab = 'all', sel = null, oq = 1, added = {};
      hsOv = document.createElement('div'); hsOv.className = 'vs-ov';
      hsOv.innerHTML = '<div class="vs-card hs-card">' +
        '<div class="hs-head"><h3>Riwayat barang</h3><button class="hs-x" data-ok="1" aria-label="Tutup">✕</button></div>' +
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
        items.forEach(function(i){ if(!i.done) inList[norm(i.name)] = i.qty; });
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
        var c = catOf(h); if(CAT_ORDER.indexOf(c) < 0) c = 'Lainnya';
        H('hs-foot').innerHTML = '<div class="hs-sel"><div class="nm">' + api.esc(h.name) + '</div>' +
          '<select id="hs-cat" aria-label="Kategori">' + CAT_ORDER.map(function(n){
            return '<option' + (n === c ? ' selected' : '') + '>' + api.esc(n) + '</option>';
          }).join('') + '</select><button class="hs-del" data-del="1" aria-label="Hapus dari riwayat">🗑</button></div>' +
          '<div class="hs-act"><div class="hs-step"><button data-s="-1" aria-label="Kurang">−</button>' +
          '<input id="hs-qty" inputmode="numeric" value="' + oq + '" onfocus="this.select()"><button data-s="1" aria-label="Tambah">+</button></div>' +
          '<button class="hs-add" data-add="1">Tambah ke daftar</button></div>';
      }
      function close(){ if(hsOv){ hsOv.remove(); hsOv = null; } }
      hsOv.addEventListener('input', function(e){
        if(e.target.id === 'hs-q'){ q = e.target.value; sel = null; drawBody(); drawFoot(); }
      });
      hsOv.addEventListener('change', function(e){
        if(e.target.id === 'hs-cat' && sel && hist[sel]){
          readQty();
          hist[sel].cat = e.target.value; hst.set(hist);
          if(tab !== 'all') tab = e.target.value;
          drawBody(); drawFoot();
        }
      });
      hsOv.addEventListener('click', function(e){
        if(e.target === hsOv || e.target.closest('[data-ok]')){ close(); return; }
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
        if(e.target.closest('[data-add]') && sel && hist[sel]){
          readQty();
          var h = hist[sel], k2 = sel, ex = items.filter(function(x){ return !x.done && norm(x.name) === k2; })[0];
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
      drawBody(); drawFoot();
    }
    L('b-hs').onclick = openHistory;
    L('b-ps').onclick = openPaste;

    /* ruang kosong di bawah daftar = tinggi bar input (otomatis ikut berubah) */
    var addbar = L('b-addbar'), ro = null;
    function fitPad(){ L('b-list').style.paddingBottom = (addbar.offsetHeight + 24) + 'px'; }
    if(window.ResizeObserver){ ro = new ResizeObserver(fitPad); ro.observe(addbar); }
    window.addEventListener('resize', fitPad);
    fitPad();

    render();

    return {
      destroy: function(){ if(ro) ro.disconnect(); window.removeEventListener('resize', fitPad); if(listening) stopVoice(); [vsOv, hsOv, psOv].forEach(function(o){ if(o) o.remove(); }); vsOv = hsOv = psOv = null; },
      /* aksi di menu ⋯ */
      menu: [
        { label: 'Riwayat barang', run: openHistory },
        { label: 'Tempel daftar', run: openPaste },
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
