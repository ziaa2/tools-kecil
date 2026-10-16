/* =====================================================================
   TOOL: Banding Harga  (versi sederhana)
   Tiap produk cuma 2 isian: Harga dan Isi (mis. "500 g", "1 kg", "3x250 ml").
   Satuan dikenali otomatis, hasil langsung muncul.
   ===================================================================== */
(function(){
  var MAX_ROWS = 5;
  var LETTERS = 'ABCDE';

  /* satuan → [jenis, pengali ke satuan dasar]  (w=berat g, v=volume ml, c=jumlah pcs, l=panjang m) */
  var UNITS = {
    g: ['w', 1], gr: ['w', 1], gram: ['w', 1], kg: ['w', 1000], kilo: ['w', 1000], kilogram: ['w', 1000],
    ml: ['v', 1], l: ['v', 1000], lt: ['v', 1000], ltr: ['v', 1000], liter: ['v', 1000],
    pcs: ['c', 1], pc: ['c', 1], buah: ['c', 1], biji: ['c', 1], butir: ['c', 1], lembar: ['c', 1],
    sachet: ['c', 1], saset: ['c', 1], bks: ['c', 1], bungkus: ['c', 1], botol: ['c', 1], btl: ['c', 1],
    kaleng: ['c', 1], roll: ['c', 1], rol: ['c', 1], pak: ['c', 1], lusin: ['c', 12], kodi: ['c', 20],
    m: ['l', 1], meter: ['l', 1], cm: ['l', 0.01]
  };
  /* tampilan per jenis: label dan pengali harga standar */
  var STD = { w: ['100 g', 100], v: ['100 ml', 100], c: ['pcs', 1], l: ['meter', 1] };
  var DIM_NAME = { w: 'berat', v: 'volume', c: 'jumlah', l: 'panjang' };

  /* "12.000", "12000", "12k", "1,5", "0.5" → angka */
  function parseNum(s){
    s = String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, '').replace(/^rp\.?/, '');
    if(!s) return 0;
    var k = s.match(/^(\d+(?:[.,]\d+)?)(k|rb)$/);
    if(k) return parseFloat(k[1].replace(',', '.')) * 1000;
    if(/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(',', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  /* "500 g" / "1kg" / "3x250 ml" / "12" → {dim, base} atau {err} atau null (kosong) */
  function parseSize(txt){
    var s = String(txt || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if(!s) return null;
    var m = s.match(/^(?:(\d[\d.,]*)\s*[x×*]\s*)?(\d[\d.,]*)\s*([a-z]*)\.?$/);
    if(!m) return { err: 'format' };
    var mult = m[1] ? parseNum(m[1]) : 1, size = parseNum(m[2]), unit = m[3] || 'pcs';
    if(!(mult > 0 && size > 0)) return { err: 'format' };
    var u = UNITS[unit];
    if(!u) return { err: 'unit' };
    return { dim: u[0], base: mult * size * u[1] };
  }
  function money(n){
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: n < 100 ? 1 : 0 });
  }

  App.registerTool({
    id: 'banding',
    icon: '⚖️',
    title: 'Banding Harga',
    desc: 'Isi harga dan ukuran dua produk, langsung ketahuan mana yang lebih murah per satuan.',
    keywords: 'harga murah hemat satuan belanja perbandingan unit price bandingkan',

    css: '' +
      '.bh-eg{color:var(--muted);font-size:13px;margin:0 0 14px 4px;line-height:1.5}' +
      '.bh-sum{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:14px;transition:border-color .2s}' +
      '.bh-sum.win{border-color:rgba(94,234,212,.55)}' +
      '.bh-st{font-size:18px;font-weight:650;line-height:1.3}' +
      '.bh-ss{color:var(--muted);font-size:13.5px;margin-top:5px;line-height:1.45}' +
      '.bh-list{display:flex;flex-direction:column;gap:10px;margin-bottom:10px}' +
      '.bh-row{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px;transition:border-color .2s}' +
      '.bh-row.best{border-color:var(--accent)}' +
      '.bh-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;min-height:24px}' +
      '.bh-t{font-size:14px;font-weight:600}' +
      '.bh-del{width:34px;height:30px;border-radius:10px;color:var(--muted);font-size:15px;display:grid;place-items:center}' +
      '.bh-del:active{background:var(--surface2);color:var(--danger)}' +
      '.bh-in{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
      '.bh-in span{display:block;color:var(--muted);font-size:12px;margin:0 0 4px 4px}' +
      '.bh-in input{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:12px;outline:0;font:inherit;font-size:16px;color:var(--text)}' +
      '.bh-in input:focus{border-color:var(--accent)}' +
      '.bh-res{margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-height:22px}' +
      '.bh-price{font-size:16px;font-weight:600}' +
      '.bh-badge{font-size:12px;padding:3px 10px;border-radius:99px;white-space:nowrap}' +
      '.bh-badge.best{background:rgba(94,234,212,.14);color:var(--accent)}' +
      '.bh-badge.more{background:rgba(251,191,36,.12);color:#fbbf24}' +
      '.bh-hint{color:var(--muted);font-size:12.5px}' +
      '.bh-add{width:100%;padding:13px;border-radius:14px;border:1px dashed var(--line);color:var(--accent);font-size:15px}' +
      '.bh-add:active{background:var(--surface)}',

    mount: function(root, api){
      var st = api.store('banding');
      var s = st.get({}) || {};

      function newRow(){ return { id: api.uid(), price: '', size: '' }; }
      /* mendukung data dari versi lama (qty + isi + satuan digabung jadi satu teks) */
      function clean(r){
        var size = String(r.size || '');
        if(r.unit && size && /^[\d.,]+$/.test(size)){
          var q = parseNum(r.qty);
          size = (q > 1 ? q + 'x' : '') + size + ' ' + r.unit;
        }
        return { id: typeof r.id === 'string' ? r.id : api.uid(), price: String(r.price || ''), size: size };
      }
      var rows = (Array.isArray(s.rows) && s.rows.length >= 2) ? s.rows.slice(0, MAX_ROWS).map(clean) : [newRow(), newRow()];
      function persist(){ st.set({ rows: rows }); }

      root.innerHTML =
        '<p class="bh-eg">Contoh isi: <b>500 g</b> · <b>1 kg</b> · <b>250 ml</b> · <b>1 l</b> · <b>3x250 ml</b> · <b>12 pcs</b></p>' +
        '<div class="bh-sum" id="bh-sum"></div>' +
        '<div class="bh-list" id="bh-list"></div>' +
        '<button class="bh-add" id="bh-add">+ Tambah produk</button>';
      var L = function(id){ return root.querySelector('#' + id); };

      /* ---------- hitung ---------- */
      function analyse(){
        var calc = rows.map(function(r){
          var price = parseNum(r.price), size = parseSize(r.size);
          var empty = !String(r.price).trim() && !String(r.size).trim();
          if(empty) return { state: 'empty' };
          if(!(price > 0)) return { state: 'noprice' };
          if(!size) return { state: 'nosize' };
          if(size.err) return { state: size.err };
          return { state: 'ok', dim: size.dim, price: price, base: size.base, std: price / size.base * STD[size.dim][1] };
        });
        var first = calc.filter(function(c){ return c.state === 'ok'; })[0];
        var dim = first ? first.dim : null;
        calc.forEach(function(c){ if(c.state === 'ok' && c.dim !== dim) c.state = 'mixed'; });
        var valid = calc.filter(function(c){ return c.state === 'ok'; });
        var out = { calc: calc, n: valid.length, dim: dim };
        if(valid.length >= 2){
          var stds = valid.map(function(c){ return c.std; });
          out.min = Math.min.apply(null, stds); out.max = Math.max.apply(null, stds);
          out.win = calc.findIndex(function(c){ return c.state === 'ok' && c.std === out.min; });
          out.loss = calc.findIndex(function(c){ return c.state === 'ok' && c.std === out.max; });
          out.same = out.max / out.min < 1.005;
          out.save = Math.round((out.max - out.min) / out.max * 100);
        }
        return out;
      }
      function nameOf(i){ return 'Produk ' + LETTERS.charAt(i); }

      /* ---------- tampilan ---------- */
      function rowHtml(r, i){
        return '<div class="bh-row" data-id="' + r.id + '">' +
          '<div class="bh-hd"><span class="bh-t">' + nameOf(i) + '</span>' +
          (rows.length > 2 ? '<button class="bh-del" data-act="del" aria-label="Hapus produk">✕</button>' : '') + '</div>' +
          '<div class="bh-in">' +
            '<label><span>Harga (Rp)</span><input data-k="price" inputmode="numeric" value="' + api.esc(r.price) + '" placeholder="12000" autocomplete="off"></label>' +
            '<label><span>Isi</span><input data-k="size" value="' + api.esc(r.size) + '" placeholder="500 g" autocomplete="off" autocapitalize="off"></label>' +
          '</div><div class="bh-res"></div></div>';
      }
      function renderRows(){
        L('bh-list').innerHTML = rows.map(rowHtml).join('');
        L('bh-add').hidden = rows.length >= MAX_ROWS;
        update();
      }
      /* hanya memperbarui hasil, tanpa menggambar ulang kolom (supaya ketikan tidak terputus) */
      function update(){
        var a = analyse();
        var els = L('bh-list').querySelectorAll('.bh-row');
        a.calc.forEach(function(c, i){
          var el = els[i]; if(!el) return;
          var res = el.querySelector('.bh-res');
          var isBest = c.state === 'ok' && a.n >= 2 && c.std === a.min;
          el.classList.toggle('best', isBest);
          if(c.state === 'ok'){
            var badge = '';
            if(a.n >= 2){
              badge = isBest ? '<span class="bh-badge best">🏆 Termurah</span>'
                : '<span class="bh-badge more">lebih mahal ' + Math.round((c.std / a.min - 1) * 100) + '%</span>';
            }
            res.innerHTML = '<span class="bh-price">' + money(c.std) + ' / ' + STD[c.dim][0] + '</span>' + badge;
          }else{
            var hint = {
              empty: '',
              noprice: 'Isi harga dulu',
              nosize: 'Isi ukuran, mis. 500 g',
              unit: 'Satuan tidak dikenal. Pakai g, kg, ml, l, atau pcs',
              format: 'Format isi: 500 g, 1 kg, atau 3x250 ml',
              mixed: 'Beda jenis (' + DIM_NAME[a.dim] + ' vs ukuran ini), tidak ikut dibandingkan'
            }[c.state];
            res.innerHTML = hint ? '<span class="bh-hint">' + hint + '</span>' : '';
          }
        });

        var sum = L('bh-sum');
        sum.classList.toggle('win', a.n >= 2 && !a.same);
        if(a.n < 2){
          sum.innerHTML = '<div class="bh-st">Bandingkan harga</div><div class="bh-ss">Isi harga dan isi dua produk di bawah. Hasil muncul otomatis.</div>';
        }else if(a.same){
          sum.innerHTML = '<div class="bh-st">Harganya hampir sama</div><div class="bh-ss">Selisihnya kurang dari 1% per ' + STD[a.dim][0] + '.</div>';
        }else{
          sum.innerHTML = '<div class="bh-st">🏆 ' + nameOf(a.win) + ' paling hemat</div>' +
            '<div class="bh-ss">' + money(a.min) + ' per ' + STD[a.dim][0] + ' · hemat ' + a.save + '% dibanding ' + nameOf(a.loss) + ' (' + money(a.max) + ')</div>';
        }
      }

      /* ---------- event ---------- */
      function onField(e){
        var k = e.target.dataset && e.target.dataset.k; if(!k) return;
        var row = e.target.closest('.bh-row'); if(!row) return;
        var r = rows.filter(function(x){ return x.id === row.dataset.id; })[0]; if(!r) return;
        r[k] = e.target.value;
        persist(); update();
      }
      L('bh-list').addEventListener('input', onField);
      L('bh-list').addEventListener('click', function(e){
        var b = e.target.closest('[data-act="del"]'); if(!b) return;
        var id = b.closest('.bh-row').dataset.id, snap = JSON.stringify(rows);
        rows = rows.filter(function(x){ return x.id !== id; });
        persist(); renderRows(); api.buzz(10);
        api.toast('Produk dihapus', function(){ rows = JSON.parse(snap); persist(); renderRows(); });
      });
      L('bh-add').onclick = function(){
        if(rows.length >= MAX_ROWS) return;
        rows.push(newRow()); persist(); renderRows(); api.buzz(8);
        var els = L('bh-list').querySelectorAll('.bh-row'), last = els[els.length - 1];
        if(last){ var inp = last.querySelector('[data-k="price"]'); if(inp) inp.focus(); }
      };

      renderRows();

      return {
        menu: [
          { label: 'Kosongkan semua', run: function(){
              var snap = JSON.stringify(rows);
              rows = [newRow(), newRow()]; persist(); renderRows(); api.buzz(12);
              api.toast('Semua produk dikosongkan', function(){ rows = JSON.parse(snap); persist(); renderRows(); });
          } }
        ]
      };
    }
  });

  if(typeof module !== 'undefined' && module.exports){ module.exports = { parseNum: parseNum, parseSize: parseSize, money: money }; }
})();
