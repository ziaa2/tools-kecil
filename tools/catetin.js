/* =====================================================================
   TOOL: Catetin  (v1 — catatan jajan harian Senin–Minggu)
   Satu file = satu tool. Pola sama dengan belanja.js.
   Fitur: strip minggu (batang pengeluaran per hari), saran dari riwayat,
          kategori otomatis, batas mingguan, ringkasan, salin hari sebelumnya,
          backup + kirim rekap ke WhatsApp.
   ===================================================================== */
App.registerTool({
  id: 'catetin',
  icon: '🧾',
  title: 'Catetin',
  desc: 'Catat jajan tiap hari dari Senin sampai Minggu: beli apa dan berapa. Lihat total harian dan mingguan, pasang batas, lalu kirim rekapnya ke WhatsApp sebagai backup. Data tersimpan di HP kamu.',

  /* teks kecil di kartu halaman utama */
  badge: function(){
    try{
      var items = JSON.parse(localStorage.getItem('toolskecil:catetin:v1') || '[]');
      var t = new Date(), p = function(n){ return (n < 10 ? '0' : '') + n; };
      var k = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
      var sum = 0, n = 0;
      items.forEach(function(i){ if(i.d === k){ sum += (i.price || 0) * (i.qty || 1); n++; } });
      return n ? 'Hari ini Rp ' + sum.toLocaleString('id-ID') : 'belum dicatat hari ini';
    }catch(e){ return ''; }
  },

  /* CSS khusus tool ini (otomatis disuntik) */
  css: [
    /* navigasi minggu */
    '.cn-wk{display:flex;align-items:center;gap:8px;margin:0 0 10px}',
    '.cn-wk .lbl{flex:1;min-width:0;text-align:center;font-size:15px;font-weight:600}',
    '.cn-wk .lbl small{display:block;font-weight:400;color:var(--muted);font-size:12px;margin-top:1px}',
    '.cn-wk .lbl button{color:var(--accent);font-size:12px;padding:0}',
    '.cn-nav{width:40px;height:40px;flex:none;border-radius:12px;background:var(--surface);border:1px solid var(--line);font-size:16px;display:grid;place-items:center}',
    '.cn-nav:disabled{opacity:.3}',
    /* ringkasan minggu */
    '.cn-sum{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:12px}',
    '.cn-srow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px}',
    '.cn-big{font-size:26px;font-weight:650;letter-spacing:-.5px}',
    '.cn-small{color:var(--muted);font-size:12.5px;text-align:right}',
    '.cn-bar{height:6px;background:var(--surface2);border-radius:99px;overflow:hidden}',
    '.cn-bar i{display:block;height:100%;width:0;background:var(--accent);border-radius:99px;transition:width .3s ease,background .3s}',
    '.cn-bar.warn i{background:#f59e0b}.cn-bar.over i{background:var(--danger)}',
    '.cn-lrow{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:9px;font-size:12.5px;color:var(--muted)}',
    '.cn-lrow .over{color:var(--danger)}',
    '.cn-lrow button{color:var(--accent);font-size:12.5px;padding:2px 0}',
    /* strip hari: batang = pengeluaran harian, sekaligus pemilih hari */
    '.cn-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-bottom:14px}',
    '.cn-day{display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px 2px 7px;border-radius:14px;background:var(--surface);border:1px solid var(--line);min-width:0}',
    '.cn-day .dn{font-size:11.5px;color:var(--muted)}',
    '.cn-day .bx{height:40px;width:100%;display:flex;align-items:flex-end;justify-content:center}',
    '.cn-day .bx i{display:block;width:12px;min-height:3px;border-radius:5px 5px 2px 2px;background:var(--surface2);transition:height .25s ease}',
    '.cn-day.has .bx i{background:var(--accent);opacity:.55}',
    '.cn-day .dd{font-size:15px;font-weight:600;line-height:1}',
    '.cn-day .da{font-size:10.5px;color:var(--muted);line-height:1;height:11px;white-space:nowrap}',
    '.cn-day.today .dd::after{content:"";display:block;width:4px;height:4px;border-radius:50%;background:var(--accent);margin:4px auto 0}',
    '.cn-day.on{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}',
    '.cn-day.on .bx i{opacity:1}',
    '.cn-day.on .dn{color:var(--accent)}',
    '.cn-day.past-over .bx i{background:var(--danger)}',
    /* hari terpilih */
    '.cn-dh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 4px 8px}',
    '.cn-dh b{font-size:15px;font-weight:600}',
    '.cn-dh span{font-size:14px;color:var(--muted)}',
    '.cn-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}',
    '.cn-it{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px 6px 10px 12px}',
    '.cn-it.new{animation:cnpop .22s ease}',
    '@keyframes cnpop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}',
    '.cn-e{width:34px;height:34px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;font-size:17px;flex:none}',
    '.cn-info{flex:1;min-width:0;text-align:left}',
    '.cn-name{font-size:15.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.cn-meta{font-size:12px;color:var(--muted);margin-top:2px}',
    '.cn-amt{font-size:14.5px;font-weight:600;flex:none;padding-left:4px}',
    '.cn-ed,.cn-x{width:34px;height:36px;border-radius:10px;color:var(--muted);display:grid;place-items:center;flex:none}',
    '.cn-ed{font-size:15px}.cn-x{font-size:17px}',
    '.cn-ed:active{background:var(--surface2);color:var(--accent)}',
    '.cn-x:active{background:var(--surface2);color:var(--danger)}',
    '.cn-empty{text-align:center;color:var(--muted);padding:34px 10px;font-size:15px;line-height:1.5}',
    '.cn-empty .em{font-size:36px;display:block;margin-bottom:8px;opacity:.8}',
    /* bar input bawah */
    '.cn-addbar{position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line);z-index:5}',
    '.cn-addwrap{max-width:560px;margin:0 auto}',
    '.cn-sugg,.cn-qrow,.cn-cats{display:flex;gap:6px;overflow-x:auto;padding:0 0 8px;scrollbar-width:none}',
    '.cn-sugg::-webkit-scrollbar,.cn-qrow::-webkit-scrollbar,.cn-cats::-webkit-scrollbar{display:none}',
    '.cn-cats.wrap{flex-wrap:wrap;overflow:visible}',
    '.cn-sugg-l{flex:none;align-self:center;color:var(--muted);font-size:12px;padding-right:2px}',
    '.cn-chip,.cn-qb,.cn-cat{flex:none;background:var(--surface2);border:1px solid var(--line);border-radius:99px;white-space:nowrap}',
    '.cn-chip{padding:7px 13px;font-size:14px}',
    '.cn-chip small{color:var(--muted);margin-left:5px;font-size:11px}',
    '.cn-chip:active{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}',
    '.cn-chip:active small{color:var(--accent-ink)}',
    '.cn-qb{padding:8px 13px;font-size:13px}',
    '.cn-qb:active{background:var(--surface)}',
    '.cn-cat{padding:6px 11px;font-size:13px}',
    '.cn-cat.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}',
    '.cn-addin{display:flex;gap:6px;background:var(--surface2);border:1px solid var(--line);border-radius:18px;padding:6px}',
    '.cn-addin:focus-within{border-color:var(--accent)}',
    '.cn-addin input{background:none;border:0;outline:0;padding:10px 8px;min-width:0}',
    '.cn-iname{flex:1}',
    '.cn-iprice{width:78px;text-align:right;border-left:1px solid var(--line)!important}',
    '.cn-iqty{width:42px;text-align:center;border-left:1px solid var(--line)!important}',
    '.cn-add{width:46px;height:46px;flex:none;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:24px;font-weight:600;display:grid;place-items:center}',
    '.cn-add:active{transform:scale(.92)}',
    /* sheet (edit, ringkasan, batas) */
    '.cn-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:30;display:grid;place-items:end center}',
    '.cn-card{width:100%;max-width:560px;max-height:86vh;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:20px 20px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom,0px))}',
    '.cn-card h3{margin:0 0 12px;font-size:17px}',
    '.cn-fl{display:block;margin:0 0 10px;font-size:12.5px;color:var(--muted)}',
    '.cn-in{display:block;width:100%;margin-top:5px;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:11px 12px;outline:0;color:inherit;font:inherit;font-size:15px}',
    '.cn-in:focus{border-color:var(--accent)}',
    '.cn-two{display:grid;grid-template-columns:2fr 1fr;gap:8px}',
    '.cn-act{display:flex;gap:8px;margin-top:14px}',
    '.cn-ok{flex:1;padding:12px;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-weight:600}',
    '.cn-no{padding:12px 16px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--danger)}',
    '.cn-note{font-size:12px;color:var(--muted);line-height:1.45;margin:0 0 10px}',
    /* isi ringkasan */
    '.cn-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}',
    '.cn-stat{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px}',
    '.cn-stat small{display:block;color:var(--muted);font-size:11.5px;margin-bottom:3px}',
    '.cn-stat b{font-size:15px;font-weight:600}',
    '.cn-stat b.up{color:var(--danger)}.cn-stat b.down{color:var(--accent)}',
    '.cn-h{margin:14px 0 6px;font-size:12.5px;color:var(--muted)}',
    '.cn-brow{display:grid;grid-template-columns:92px 1fr auto;align-items:center;gap:10px;margin-bottom:7px;font-size:13.5px}',
    '.cn-brow .t{height:8px;border-radius:99px;background:var(--surface2);overflow:hidden}',
    '.cn-brow .t i{display:block;height:100%;background:var(--accent);border-radius:99px}',
    '.cn-brow .v{color:var(--muted);font-size:12.5px}',
    '.cn-trow{display:flex;justify-content:space-between;gap:10px;font-size:14px;padding:6px 0;border-bottom:1px solid var(--line)}',
    '.cn-trow:last-child{border-bottom:0}',
    '.cn-trow span:last-child{color:var(--muted);flex:none}',
    /* aksesibilitas */
    '.cn-day:focus-visible,.cn-nav:focus-visible,.cn-chip:focus-visible,.cn-qb:focus-visible,.cn-cat:focus-visible,.cn-add:focus-visible,.cn-ok:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
    '@media (prefers-reduced-motion:reduce){.cn-it.new{animation:none}.cn-bar i,.cn-day .bx i{transition:none}}'
  ].join(''),

  mount: function(root, api){
    var st = api.store('catetin');                 // daftar catatan: [{id, d:'YYYY-MM-DD', name, qty, price, cat}]
    var hst = api.store('catetin-riwayat');        // riwayat jajan: { kunci: {name, n, qty, price, cat, last} }
    var pst = api.store('catetin-pref');           // pengaturan: { limit }
    var items = st.get([]);
    var hist = hst.get({});
    var pref = pst.get({ limit: 0 });

    var CATS = [
      { n: 'Makan', e: '🍚' }, { n: 'Minum', e: '🧋' }, { n: 'Kopi', e: '☕' },
      { n: 'Camilan', e: '🍟' }, { n: 'Lainnya', e: '✨' }
    ];
    var GUESS = [
      ['Kopi', /kopi|latte|americano|espresso|cappuccino|kapal api/],
      ['Minum', /\bes\b|teh|jus|susu|boba|thai tea|\bair\b|minum|soda|cendol|kelapa|yakult|pocari/],
      ['Camilan', /gorengan|keripik|snack|cilok|donat|cokelat|coklat|permen|kue|roti|pisang|batagor|cimol|risol|martabak|seblak|chiki|wafer|biskuit/],
      ['Makan', /nasi|\bmie\b|\bmi\b|bakso|ayam|soto|sate|geprek|bubur|lontong|pecel|gado|ketoprak|makan|burger|pizza|ikan|telur/]
    ];
    var HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    var HARI_P = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var BLN_P = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    var wk = 0;                    // 0 = minggu ini, -1 = minggu lalu, dst
    var sel = todayIdx();          // hari terpilih: 0 (Senin) … 6 (Minggu)
    var catPick = null;            // null = kategori ditebak otomatis dari nama
    var justAdded = null;
    var ov = null;

    root.innerHTML =
      '<div class="cn-wk"><button class="cn-nav" data-act="prev" aria-label="Minggu sebelumnya">‹</button>' +
        '<div class="lbl"><span id="c-wlbl"></span><small id="c-wsub"></small></div>' +
        '<button class="cn-nav" data-act="next" id="c-next" aria-label="Minggu berikutnya">›</button></div>' +
      '<div class="cn-sum"><div class="cn-srow"><div class="cn-big" id="c-total">Rp 0</div><div class="cn-small" id="c-avg"></div></div>' +
        '<div class="cn-bar" id="c-bar"><i id="c-prog"></i></div>' +
        '<div class="cn-lrow"><span id="c-left"></span><button data-act="limit" id="c-lim"></button></div></div>' +
      '<div class="cn-days" id="c-days"></div>' +
      '<div class="cn-dh"><b id="c-dtitle"></b><span id="c-dtotal"></span></div>' +
      '<ul class="cn-list" id="c-list"></ul>' +
      '<div class="cn-addbar" id="c-addbar"><div class="cn-addwrap">' +
        '<div class="cn-sugg" id="c-sugg"></div>' +
        '<div class="cn-qrow"><button class="cn-qb" data-act="copy">📋 Salin hari sebelumnya</button><button class="cn-qb" data-act="summary">📊 Ringkasan</button></div>' +
        '<div class="cn-cats" id="c-cats"></div>' +
        '<div class="cn-addin">' +
          '<input class="cn-iname" id="c-name" placeholder="Jajan apa?" autocomplete="off" enterkeyhint="next" aria-label="Nama jajan">' +
          '<input class="cn-iprice" id="c-price" inputmode="numeric" placeholder="Harga" enterkeyhint="done" aria-label="Harga">' +
          '<input class="cn-iqty" id="c-qty" inputmode="numeric" value="1" aria-label="Jumlah">' +
          '<button class="cn-add" id="c-add" aria-label="Tambah">+</button></div>' +
      '</div></div>';

    var L = function(id){ return root.querySelector('#' + id); };

    /* ---------- tanggal & hitung-hitungan ---------- */
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function ymd(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function todayIdx(){ return (new Date().getDay() + 6) % 7; }
    function dayDate(w, i){                            // tanggal hari ke-i (Senin = 0) pada minggu ke-w
      var t = new Date(); t.setHours(0, 0, 0, 0);
      return new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7) + w * 7 + i);
    }
    function dayKey(w, i){ return ymd(dayDate(w, i)); }
    function weekKeys(w){ var a = []; for(var i = 0; i < 7; i++) a.push(dayKey(w, i)); return a; }
    function amt(i){ return (i.price || 0) * (i.qty || 1); }
    function sumOf(arr){ return arr.reduce(function(s, i){ return s + amt(i); }, 0); }
    function dayItems(k){ return items.filter(function(i){ return i.d === k; }); }
    function weekItems(w){ var ks = weekKeys(w); return items.filter(function(i){ return ks.indexOf(i.d) > -1; }); }
    function norm(s){ return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }
    function short(n){
      if(!n) return '';
      if(n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'jt';
      if(n >= 1000) return Math.round(n / 1000) + 'rb';
      return String(n);
    }
    /* "5rb", "5k", "1,5rb" dan "5.000" sama-sama dimengerti */
    function money(s){
      s = String(s || '').toLowerCase().trim();
      var m = s.match(/^(\d+(?:[.,]\d+)?)\s*(rb|k|ribu)$/);
      if(m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1000);
      return parseInt(s.replace(/\D/g, ''), 10) || 0;
    }
    function emo(c){ for(var i = 0; i < CATS.length; i++) if(CATS[i].n === c) return CATS[i].e; return '✨'; }
    function guess(name){
      var k = norm(name);
      if(hist[k] && hist[k].cat) return hist[k].cat;
      for(var i = 0; i < GUESS.length; i++) if(GUESS[i][1].test(k)) return GUESS[i][0];
      return 'Lainnya';
    }
    function weekLabel(w){
      var a = dayDate(w, 0), b = dayDate(w, 6);
      return a.getMonth() === b.getMonth()
        ? a.getDate() + '–' + b.getDate() + ' ' + BLN[b.getMonth()] + ' ' + b.getFullYear()
        : a.getDate() + ' ' + BLN[a.getMonth()] + ' – ' + b.getDate() + ' ' + BLN[b.getMonth()] + ' ' + b.getFullYear();
    }
    function elapsedDays(w){ return w === 0 ? todayIdx() + 1 : 7; }

    /* ---------- riwayat & saran ---------- */
    function learn(it){
      var k = norm(it.name);
      var h = hist[k] || { name: it.name, n: 0 };
      h.name = it.name; h.n += 1; h.qty = it.qty; h.price = it.price || h.price || 0; h.cat = it.cat; h.last = Date.now();
      hist[k] = h;
      var keys = Object.keys(hist);
      if(keys.length > 300){
        keys.sort(function(a, b){ return (hist[a].n - hist[b].n) || (hist[a].last - hist[b].last); });
        keys.slice(0, keys.length - 300).forEach(function(x){ delete hist[x]; });
      }
      hst.set(hist);
    }
    function touchHist(it){       // sesuaikan riwayat setelah edit, tanpa menambah hitungan
      var h = hist[norm(it.name)];
      if(h){ h.price = it.price || h.price; h.cat = it.cat; hst.set(hist); }
    }
    function suggestions(q){
      q = norm(q);
      var arr = Object.keys(hist).map(function(k){ return { k: k, h: hist[k], s: 0 }; });
      if(q){
        arr = arr.filter(function(o){
          if(o.k.indexOf(q) === 0){ o.s = 2; return true; }
          if(o.k.split(' ').some(function(w){ return w.indexOf(q) === 0; })){ o.s = 1; return true; }
          return q.length >= 3 && o.k.indexOf(q) > -1;
        });
      }else{
        arr = arr.filter(function(o){ return o.h.n >= 2; });
      }
      arr.sort(function(a, b){ return (b.s - a.s) || (b.h.n - a.h.n) || (b.h.last - a.h.last); });
      return arr.slice(0, 6).map(function(o){ return o.h; });
    }
    function renderSugg(){
      var q = L('c-name').value, list = suggestions(q);
      if(!list.length){ L('c-sugg').innerHTML = ''; return; }
      L('c-sugg').innerHTML = (q.trim() ? '' : '<span class="cn-sugg-l">Sering:</span>') + list.map(function(h){
        return '<button class="cn-chip" data-k="' + api.esc(norm(h.name)) + '">' + api.esc(h.name) +
          (h.price ? '<small>' + api.rp(h.price) + '</small>' : '') + '</button>';
      }).join('');
    }
    function catsHTML(on){
      return CATS.map(function(c){
        return '<button class="cn-cat' + (c.n === on ? ' on' : '') + '" data-c="' + c.n + '">' + c.e + ' ' + c.n + '</button>';
      }).join('');
    }
    function renderCats(){ L('c-cats').innerHTML = catsHTML(catPick || guess(L('c-name').value)); }

    /* ---------- tampilan ---------- */
    function render(){
      var keys = weekKeys(wk), today = ymd(new Date());
      var tot = keys.map(function(k){ return sumOf(dayItems(k)); });
      var wsum = tot.reduce(function(a, b){ return a + b; }, 0);
      var max = Math.max.apply(null, tot.concat([1]));
      var lim = pref.limit || 0;

      /* kepala minggu */
      L('c-wlbl').textContent = weekLabel(wk);
      var sub = L('c-wsub'); sub.innerHTML = '';
      if(wk === 0) sub.textContent = 'Minggu ini';
      else{
        sub.appendChild(document.createTextNode((wk === -1 ? 'Minggu lalu' : (-wk) + ' minggu lalu') + ' · '));
        var back = document.createElement('button'); back.textContent = 'ke minggu ini'; back.setAttribute('data-act', 'now'); sub.appendChild(back);
      }
      L('c-next').disabled = wk >= 0;

      /* total & batas */
      L('c-total').textContent = api.rp(wsum);
      L('c-avg').textContent = wsum ? 'rata-rata ' + api.rp(Math.round(wsum / elapsedDays(wk))) + '/hari' : '';
      var pct = lim ? wsum / lim : 0;
      L('c-bar').className = 'cn-bar' + (pct > 1 ? ' over' : pct >= .8 ? ' warn' : '');
      L('c-prog').style.width = (lim ? Math.min(pct, 1) * 100 : 0) + '%';
      var left = L('c-left');
      if(lim){
        left.className = pct > 1 ? 'over' : '';
        left.textContent = pct > 1 ? 'Lewat ' + api.rp(wsum - lim) + ' dari batas ' + api.rp(lim) : 'Sisa ' + api.rp(lim - wsum) + ' dari batas ' + api.rp(lim);
      }else{ left.className = ''; left.textContent = 'Belum ada batas mingguan'; }
      L('c-lim').textContent = lim ? 'Ubah batas' : 'Atur batas';

      /* strip hari */
      L('c-days').innerHTML = keys.map(function(k, i){
        var d = dayDate(wk, i), h = tot[i] ? Math.max(8, Math.round(tot[i] / max * 100)) : 0;
        return '<button class="cn-day' + (i === sel ? ' on' : '') + (k === today ? ' today' : '') + (tot[i] ? ' has' : '') + '" data-act="day" data-i="' + i + '" aria-pressed="' + (i === sel) + '" aria-label="' + HARI[i] + ' ' + d.getDate() + '">' +
          '<span class="dn">' + HARI_P[i] + '</span>' +
          '<span class="bx"><i style="height:' + h + '%"></i></span>' +
          '<span class="dd">' + d.getDate() + '</span>' +
          '<span class="da">' + short(tot[i]) + '</span></button>';
      }).join('');

      /* hari terpilih */
      var sd = dayDate(wk, sel), dk = keys[sel], list = dayItems(dk);
      L('c-dtitle').textContent = HARI[sel] + ', ' + sd.getDate() + ' ' + BLN_P[sd.getMonth()] + (dk === today ? ' (hari ini)' : '');
      L('c-dtotal').textContent = tot[sel] ? api.rp(tot[sel]) : '';
      if(!list.length){
        L('c-list').innerHTML = '<li class="cn-empty"><span class="em">🧾</span>' +
          (dk > today ? 'Belum ada rencana jajan di hari ini.' : 'Belum ada jajan di hari ini.') + '<br>Tulis di bawah, atau salin dari hari sebelumnya.</li>';
      }else{
        L('c-list').innerHTML = list.map(function(i){
          var meta = i.qty + '×' + (i.price ? ' · ' + api.rp(i.price) : '') + ' · ' + api.esc(i.cat || 'Lainnya');
          return '<li class="cn-it' + (i.id === justAdded ? ' new' : '') + '" data-id="' + i.id + '">' +
            '<span class="cn-e">' + emo(i.cat) + '</span>' +
            '<div class="cn-info"><div class="cn-name">' + api.esc(i.name) + '</div><div class="cn-meta">' + meta + '</div></div>' +
            '<div class="cn-amt">' + (amt(i) ? api.rp(amt(i)) : '–') + '</div>' +
            '<button class="cn-ed" data-act="edit" aria-label="Ubah">✎</button>' +
            '<button class="cn-x" data-act="del" aria-label="Hapus">✕</button></li>';
        }).join('');
      }
      justAdded = null;
      renderSugg(); renderCats();
    }
    function commit(){ st.set(items); render(); }
    function undoable(msg){
      var snap = JSON.stringify(items);
      return function(){ api.toast(msg, function(){ items = JSON.parse(snap); commit(); }); };
    }

    /* ---------- tambah catatan ---------- */
    function push(name, qty, price, cat, quiet){
      var it = { id: api.uid(), d: dayKey(wk, sel), name: name, qty: qty, price: price || 0, cat: cat || guess(name) };
      items.unshift(it); justAdded = it.id; learn(it);
      if(!quiet){
        L('c-name').value = ''; L('c-price').value = ''; L('c-qty').value = '1'; L('c-price').placeholder = 'Harga'; catPick = null;
      }
      commit(); api.buzz(12);
      if(!quiet) L('c-name').focus();
    }
    function add(){
      var name = L('c-name').value.trim().replace(/\s+/g, ' ');
      if(!name){ L('c-name').focus(); return; }
      var qty = parseInt(L('c-qty').value, 10); if(!(qty > 0)) qty = 1;
      var price = money(L('c-price').value);
      if(!price && hist[norm(name)]) price = hist[norm(name)].price || 0;     // harga kosong: pakai harga terakhir
      push(name, qty, price, catPick || guess(name));
    }
    L('c-add').onclick = add;
    L('c-name').addEventListener('keydown', function(e){ if(e.key === 'Enter'){ if(L('c-price').value || !L('c-name').value.trim()) add(); else L('c-price').focus(); } });
    L('c-price').addEventListener('keydown', function(e){ if(e.key === 'Enter') add(); });
    L('c-name').addEventListener('input', function(){
      var h = hist[norm(L('c-name').value)];
      L('c-price').placeholder = h && h.price ? String(h.price) : 'Harga';
      renderSugg(); renderCats();
    });
    L('c-cats').addEventListener('click', function(e){
      var b = e.target.closest('[data-c]'); if(!b) return;
      catPick = b.dataset.c; renderCats();
    });
    /* ketuk saran = langsung masuk ke hari terpilih (jumlah, harga, kategori terakhir dipakai) */
    L('c-sugg').addEventListener('click', function(e){
      var c = e.target.closest('.cn-chip'); if(!c) return;
      var h = hist[c.dataset.k]; if(!h) return;
      push(h.name, h.qty > 0 ? h.qty : 1, h.price || 0, h.cat, true);
    });

    function copyPrev(){
      var d = dayDate(wk, sel), prev = ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
      var src = dayItems(prev);
      if(!src.length){ api.toast('Hari sebelumnya belum ada catatan'); return; }
      var u = undoable('Disalin dari hari sebelumnya'), dk = dayKey(wk, sel);
      src.slice().reverse().forEach(function(s){
        items.unshift({ id: api.uid(), d: dk, name: s.name, qty: s.qty, price: s.price, cat: s.cat });
      });
      commit(); api.buzz(12); u();
    }

    /* ---------- sheet (edit, batas, ringkasan) ---------- */
    function closeSheet(){ if(ov){ ov.remove(); ov = null; } }
    function openSheet(html){
      closeSheet();
      ov = document.createElement('div'); ov.className = 'cn-ov';
      ov.innerHTML = '<div class="cn-card" role="dialog" aria-modal="true">' + html + '</div>';
      ov.addEventListener('click', function(e){ if(e.target === ov) closeSheet(); });
      root.appendChild(ov);
      return ov;
    }

    function openEdit(id){
      var it = items.filter(function(x){ return x.id === id; })[0]; if(!it) return;
      var cat = it.cat || 'Lainnya';
      var o = openSheet('<h3>Ubah catatan</h3>' +
        '<label class="cn-fl">Nama<input class="cn-in" id="e-name" value="' + api.esc(it.name) + '"></label>' +
        '<div class="cn-two"><label class="cn-fl">Harga satuan<input class="cn-in" id="e-price" inputmode="numeric" value="' + (it.price || '') + '"></label>' +
        '<label class="cn-fl">Jumlah<input class="cn-in" id="e-qty" inputmode="numeric" value="' + it.qty + '"></label></div>' +
        '<div class="cn-fl">Kategori</div><div class="cn-cats wrap" id="e-cats">' + catsHTML(cat) + '</div>' +
        '<div class="cn-act"><button class="cn-no" id="e-del">Hapus</button><button class="cn-ok" id="e-ok">Simpan</button></div>');
      o.querySelector('#e-cats').addEventListener('click', function(e){
        var b = e.target.closest('[data-c]'); if(!b) return;
        cat = b.dataset.c; o.querySelector('#e-cats').innerHTML = catsHTML(cat);
      });
      o.querySelector('#e-ok').onclick = function(){
        var name = o.querySelector('#e-name').value.trim().replace(/\s+/g, ' ');
        if(!name){ o.querySelector('#e-name').focus(); return; }
        var qty = parseInt(o.querySelector('#e-qty').value, 10); if(!(qty > 0)) qty = 1;
        it.name = name; it.qty = qty; it.price = money(o.querySelector('#e-price').value); it.cat = cat;
        touchHist(it); closeSheet(); commit();
      };
      o.querySelector('#e-del').onclick = function(){
        closeSheet();
        var u = undoable('Catatan dihapus'); items = items.filter(function(x){ return x.id !== id; }); commit(); u();
      };
    }

    function openLimit(){
      var o = openSheet('<h3>Batas jajan mingguan</h3>' +
        '<p class="cn-note">Batas berlaku untuk tiap minggu. Batang total berubah kuning saat mencapai 80% dan merah saat lewat. Boleh ketik 150rb atau 150000.</p>' +
        '<label class="cn-fl">Batas per minggu<input class="cn-in" id="l-val" inputmode="numeric" placeholder="contoh: 150rb" value="' + (pref.limit || '') + '"></label>' +
        '<div class="cn-act">' + (pref.limit ? '<button class="cn-no" id="l-off">Hapus batas</button>' : '') + '<button class="cn-ok" id="l-ok">Simpan batas</button></div>');
      var save = function(v){ pref.limit = v; pst.set(pref); closeSheet(); render(); };
      o.querySelector('#l-ok').onclick = function(){ save(money(o.querySelector('#l-val').value)); };
      o.querySelector('#l-val').addEventListener('keydown', function(e){ if(e.key === 'Enter') save(money(this.value)); });
      if(pref.limit) o.querySelector('#l-off').onclick = function(){ save(0); };
      o.querySelector('#l-val').focus();
    }

    function openSummary(){
      var arr = weekItems(wk), total = sumOf(arr), lastTotal = sumOf(weekItems(wk - 1));
      var keys = weekKeys(wk), tot = keys.map(function(k){ return sumOf(dayItems(k)); });
      var top = 0; tot.forEach(function(v, i){ if(v > tot[top]) top = i; });
      var avg = total ? Math.round(total / elapsedDays(wk)) : 0;
      var diff = '–', cls = '';
      if(lastTotal){
        var p = Math.round((total - lastTotal) / lastTotal * 100);
        diff = (p > 0 ? '+' : '') + p + '% dari minggu lalu'; cls = p > 0 ? 'up' : p < 0 ? 'down' : '';
      }else if(total){ diff = 'minggu lalu kosong'; }

      var byCat = {}; arr.forEach(function(i){ var c = i.cat || 'Lainnya'; byCat[c] = (byCat[c] || 0) + amt(i); });
      var cats = Object.keys(byCat).filter(function(c){ return byCat[c] > 0; }).sort(function(a, b){ return byCat[b] - byCat[a]; });
      var byName = {};
      arr.forEach(function(i){
        var k = norm(i.name), o = byName[k] || (byName[k] = { name: i.name, q: 0, s: 0 });
        o.q += i.qty || 1; o.s += amt(i);
      });
      var names = Object.keys(byName).map(function(k){ return byName[k]; }).sort(function(a, b){ return (b.s - a.s) || (b.q - a.q); }).slice(0, 5);

      var html = '<h3>Ringkasan ' + weekLabel(wk) + '</h3>';
      if(!arr.length){
        html += '<p class="cn-note">Belum ada catatan di minggu ini.</p>';
      }else{
        html += '<div class="cn-stats">' +
          '<div class="cn-stat"><small>Total minggu</small><b>' + api.rp(total) + '</b></div>' +
          '<div class="cn-stat"><small>Rata-rata per hari</small><b>' + api.rp(avg) + '</b></div>' +
          '<div class="cn-stat"><small>Paling boros</small><b>' + (tot[top] ? HARI[top] + ' · ' + api.rp(tot[top]) : '–') + '</b></div>' +
          '<div class="cn-stat"><small>Banding minggu lalu</small><b class="' + cls + '">' + diff + '</b></div></div>';
        if(cats.length){
          html += '<div class="cn-h">Per kategori</div>' + cats.map(function(c){
            return '<div class="cn-brow"><span>' + emo(c) + ' ' + api.esc(c) + '</span><span class="t"><i style="width:' + Math.max(4, Math.round(byCat[c] / total * 100)) + '%"></i></span><span class="v">' + api.rp(byCat[c]) + '</span></div>';
          }).join('');
        }
        html += '<div class="cn-h">Jajan terbesar</div>' + names.map(function(o){
          return '<div class="cn-trow"><span>' + api.esc(o.name) + ' <small style="color:var(--muted)">' + o.q + '×</small></span><span>' + (o.s ? api.rp(o.s) : '–') + '</span></div>';
        }).join('');
      }
      html += '<div class="cn-act"><button class="cn-ok" id="s-ok">Tutup</button></div>';
      openSheet(html).querySelector('#s-ok').onclick = closeSheet;
    }

    /* ---------- rekap teks (untuk WhatsApp & backup) ---------- */
    function recap(w, only){        // only = indeks hari tertentu, atau undefined untuk satu minggu penuh
      var keys = weekKeys(w), fmt = function(i){ return '• ' + i.name + ' ' + i.qty + '×' + (amt(i) ? ' — ' + api.rp(amt(i)) : ''); };
      var lines = ['🧾 Catetin — ' + (only === undefined ? weekLabel(w) : HARI[only] + ', ' + dayDate(w, only).getDate() + ' ' + BLN_P[dayDate(w, only).getMonth()]), ''];
      var from = only === undefined ? 0 : only, to = only === undefined ? 6 : only, sum = 0;
      for(var i = from; i <= to; i++){
        var list = dayItems(keys[i]).slice().reverse(), s = sumOf(list); sum += s;
        if(only === undefined){
          var d = dayDate(w, i);
          lines.push(HARI[i] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + (list.length ? ' — ' + api.rp(s) : ' — belum dicatat'));
        }
        list.forEach(function(it){ lines.push(fmt(it)); });
        if(only === undefined) lines.push('');
      }
      if(only !== undefined) lines.push('');
      lines.push((only === undefined ? 'Total minggu: ' : 'Total hari ini: ') + api.rp(sum));
      if(only === undefined && pref.limit){
        lines.push(sum > pref.limit ? 'Batas ' + api.rp(pref.limit) + ' — lewat ' + api.rp(sum - pref.limit) : 'Batas ' + api.rp(pref.limit) + ' — sisa ' + api.rp(pref.limit - sum));
      }
      return lines.join('\n');
    }
    function toWA(text){ window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); }

    /* ---------- klik di halaman ---------- */
    root.addEventListener('click', function(e){
      var b = e.target.closest('[data-act]'); if(!b || (ov && ov.contains(b))) return;
      var act = b.dataset.act;
      if(act === 'prev'){ wk--; render(); }
      else if(act === 'next'){ if(wk < 0){ wk++; render(); } }
      else if(act === 'now'){ wk = 0; sel = todayIdx(); render(); }
      else if(act === 'day'){ sel = parseInt(b.dataset.i, 10); render(); }
      else if(act === 'limit'){ openLimit(); }
      else if(act === 'summary'){ openSummary(); }
      else if(act === 'copy'){ copyPrev(); }
      else{
        var li = b.closest('.cn-it'); if(!li) return;
        if(act === 'edit') openEdit(li.dataset.id);
        else if(act === 'del'){
          var u = undoable('Catatan dihapus');
          items = items.filter(function(x){ return x.id !== li.dataset.id; }); commit(); api.buzz(10); u();
        }
      }
    });

    /* ruang kosong di bawah daftar = tinggi bar input */
    var addbar = L('c-addbar'), ro = null;
    function fitPad(){ L('c-list').style.paddingBottom = (addbar.offsetHeight + 24) + 'px'; }
    if(window.ResizeObserver){ ro = new ResizeObserver(fitPad); ro.observe(addbar); }
    window.addEventListener('resize', fitPad);
    fitPad();

    render();

    return {
      destroy: function(){ if(ro) ro.disconnect(); window.removeEventListener('resize', fitPad); closeSheet(); },
      /* aksi di menu ⋯ */
      menu: [
        { label: 'Ringkasan minggu', run: openSummary },
        { label: 'Atur batas mingguan', run: openLimit },
        { label: 'Kirim rekap hari ini ke WhatsApp', run: function(){ toWA(recap(wk, sel)); } },
        { label: 'Kirim rekap minggu ini ke WhatsApp', run: function(){ toWA(recap(wk)); } },
        { label: 'Hapus catatan hari ini', danger: true, run: function(){
            var dk = dayKey(wk, sel); if(!dayItems(dk).length) return;
            var u = undoable('Catatan hari ini dihapus'); items = items.filter(function(i){ return i.d !== dk; }); commit(); api.buzz(20); u();
        } },
        { label: 'Hapus riwayat saran', danger: true, run: function(){
            var snap = JSON.stringify(hist);
            hist = {}; hst.set(hist); renderSugg(); renderCats();
            api.toast('Riwayat saran dihapus', function(){ hist = JSON.parse(snap); hst.set(hist); renderSugg(); renderCats(); });
        } },
        { label: 'Reset semua catatan', danger: true, run: function(){
            if(!items.length) return;
            var u = undoable('Semua catatan di-reset'); items = []; commit(); api.buzz(20); u();
        } }
      ],
      /* backup: dipakai menu Download / WhatsApp / Pulihkan */
      backup: {
        get: function(){ return { items: items, history: hist, pref: pref }; },
        set: function(data){
          var its = Array.isArray(data) ? data : (data && data.items);
          if(!Array.isArray(its)) throw new Error('format salah');
          items = its.filter(function(i){ return i && typeof i.d === 'string' && typeof i.name === 'string'; }).map(function(i){
            return { id: i.id || api.uid(), d: i.d, name: i.name, qty: i.qty > 0 ? i.qty : 1, price: i.price > 0 ? i.price : 0, cat: i.cat || 'Lainnya' };
          });
          if(data && !Array.isArray(data)){
            if(data.history && typeof data.history === 'object'){ hist = data.history; hst.set(hist); }
            if(data.pref && typeof data.pref === 'object'){ pref = { limit: data.pref.limit > 0 ? data.pref.limit : 0 }; pst.set(pref); }
          }
          commit();
        },
        text: function(){ return recap(wk); }
      }
    };
  }
});
