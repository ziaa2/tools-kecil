/* =====================================================================
   TOOL: Banding Harga (harga per satuan)
   Bandingkan 2–8 produk: harga, jumlah paket, isi per paket, satuan →
   harga per 100 g / 100 ml / pcs / meter, lengkap dengan yang paling hemat.
   ===================================================================== */
(function(){
  var MAX_ROWS = 8;
  var LETTERS = 'ABCDEFGH';

  var GROUPS = {
    berat:   { label: 'Berat',   def: 'g',   std: 100,  stdLabel: '100 g',  alt: 1000, altLabel: 'kg', units: [['g', 1], ['kg', 1000]] },
    volume:  { label: 'Volume',  def: 'ml',  std: 100,  stdLabel: '100 ml', alt: 1000, altLabel: 'L',  units: [['ml', 1], ['L', 1000]] },
    jumlah:  { label: 'Jumlah',  def: 'pcs', std: 1,    stdLabel: 'pcs',    alt: 0,    altLabel: '',   units: [['pcs', 1], ['lusin', 12], ['kodi', 20]] },
    panjang: { label: 'Panjang', def: 'm',   std: 1,    stdLabel: 'meter',  alt: 0,    altLabel: '',   units: [['cm', 0.01], ['m', 1]] }
  };

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
  function money(n){
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: n < 100 ? 1 : 0 });
  }
  function unitFactor(group, unit){
    var u = GROUPS[group].units.filter(function(x){ return x[0] === unit; })[0];
    return u ? u[1] : 1;
  }

  App.registerTool({
    id: 'banding',
    icon: '⚖️',
    title: 'Banding Harga',
    desc: 'Bandingkan harga beberapa produk per satuan (per 100 g, per liter, per pcs) dan lihat mana yang paling hemat. Cocok buat belanja.',
    keywords: 'harga murah hemat satuan belanja perbandingan unit price bandingkan',

    badge: function(){
      try{
        var s = JSON.parse(localStorage.getItem('toolskecil:banding:v1') || '{}');
        var n = Array.isArray(s.history) ? s.history.length : 0;
        return n ? n + ' riwayat' : 'baru';
      }catch(e){ return ''; }
    },

    css: '' +
      '.bh-tabs{display:flex;gap:6px;overflow-x:auto;margin:0 0 14px;scrollbar-width:none}' +
      '.bh-tabs::-webkit-scrollbar{display:none}' +
      '.bh-tab{flex:none;padding:9px 15px;border-radius:99px;border:1px solid var(--line);background:var(--surface);color:var(--muted);font-size:14px}' +
      '.bh-tab.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}' +
      '.bh-sum{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:14px;transition:border-color .2s}' +
      '.bh-sum.win{border-color:rgba(94,234,212,.55)}' +
      '.bh-st{font-size:17px;font-weight:650;line-height:1.3}' +
      '.bh-ss{color:var(--muted);font-size:13px;margin-top:5px;line-height:1.45}' +
      '.bh-list{display:flex;flex-direction:column;gap:10px;margin-bottom:10px}' +
      '.bh-row{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px;transition:border-color .2s}' +
      '.bh-row.best{border-color:var(--accent)}' +
      '.bh-top{display:flex;gap:8px;margin-bottom:10px}' +
      '.bh-top input{flex:1;min-width:0}' +
      '.bh-del{width:42px;border-radius:12px;color:var(--muted);font-size:16px;display:grid;place-items:center}' +
      '.bh-del:active{background:var(--surface2);color:var(--danger)}' +
      '.bh-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
      '.bh-grid label span{display:block;color:var(--muted);font-size:12px;margin:0 0 4px 4px}' +
      '.bh-row input,.bh-row select{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:0;font:inherit;font-size:16px;color:var(--text)}' +
      '.bh-row input:focus,.bh-row select:focus{border-color:var(--accent)}' +
      '.bh-res{margin-top:10px;display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap;min-height:26px}' +
      '.bh-price{font-size:18px;font-weight:650}' +
      '.bh-alt{color:var(--muted);font-size:12.5px;width:100%}' +
      '.bh-badge{font-size:12px;padding:3px 10px;border-radius:99px;white-space:nowrap}' +
      '.bh-badge.best{background:rgba(94,234,212,.14);color:var(--accent)}' +
      '.bh-badge.more{background:rgba(251,191,36,.12);color:#fbbf24}' +
      '.bh-hint{color:var(--muted);font-size:13px}' +
      '.bh-add{width:100%;padding:13px;border-radius:14px;border:1px dashed var(--line);color:var(--accent);font-size:15px;margin-bottom:12px}' +
      '.bh-add:active{background:var(--surface)}' +
      '.bh-act{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:6px}' +
      '.bh-act button{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 6px;font-size:14.5px}' +
      '.bh-act button:active{background:var(--surface2)}' +
      '.bh-h2{color:var(--muted);font-size:12px;letter-spacing:.4px;text-transform:uppercase;margin:24px 4px 10px}' +
      '.bh-h{display:flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:4px 4px 4px 14px;margin-bottom:8px}' +
      '.bh-hm{flex:1;min-width:0;padding:8px 0;cursor:pointer}' +
      '.bh-ht{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.bh-hs{color:var(--muted);font-size:12.5px;margin-top:2px}' +
      '.bh-hd{width:40px;height:44px;border-radius:12px;color:var(--muted);font-size:16px;display:grid;place-items:center}' +
      '.bh-hd:active{background:var(--surface2);color:var(--danger)}',

    mount: function(root, api){
      var st = api.store('banding');
      var s = st.get({}) || {};
      var group = GROUPS[s.group] ? s.group : 'berat';

      function newRow(){ return { id: api.uid(), name: '', price: '', qty: '1', size: '', unit: GROUPS[group].def }; }
      function clean(r){
        var unitOk = GROUPS[group].units.some(function(u){ return u[0] === r.unit; });
        return {
          id: typeof r.id === 'string' ? r.id : api.uid(),
          name: String(r.name || ''), price: String(r.price || ''), qty: String(r.qty || '1'), size: String(r.size || ''),
          unit: unitOk ? r.unit : GROUPS[group].def
        };
      }
      var rows = (Array.isArray(s.rows) && s.rows.length >= 2) ? s.rows.slice(0, MAX_ROWS).map(clean) : [newRow(), newRow()];
      var history = (Array.isArray(s.history) ? s.history : []).filter(function(h){
        return h && typeof h.id === 'string' && GROUPS[h.group] && Array.isArray(h.rows) && h.rows.length >= 2;
      });
      function persist(){ st.set({ group: group, rows: rows, history: history }); }

      root.innerHTML =
        '<div class="bh-tabs" id="bh-tabs"></div>' +
        '<div class="bh-sum" id="bh-sum"></div>' +
        '<div class="bh-list" id="bh-list"></div>' +
        '<button class="bh-add" id="bh-add">+ Tambah produk</button>' +
        '<div class="bh-act"><button id="bh-share">💬 Bagikan</button><button id="bh-copy">📋 Salin</button><button id="bh-save">⭐ Simpan</button></div>' +
        '<div id="bh-hist"></div>';
      var L = function(id){ return root.querySelector('#' + id); };

      function nameOf(i){ return (rows[i].name || '').trim() || ('Produk ' + LETTERS.charAt(i)); }

      /* ---------- perhitungan ---------- */
      function compute(){
        var g = GROUPS[group];
        return rows.map(function(r){
          var price = parseNum(r.price), qty = parseNum(r.qty), size = parseNum(r.size);
          if(!(price > 0 && qty > 0 && size > 0)) return { ok: false };
          var total = qty * size * unitFactor(group, r.unit);         // dalam satuan dasar (g / ml / pcs / m)
          var perBase = price / total;
          return { ok: true, std: perBase * g.std, alt: g.alt ? perBase * g.alt : 0 };
        });
      }
      function analyse(){
        var calc = compute(), valid = calc.filter(function(c){ return c.ok; });
        var out = { calc: calc, n: valid.length };
        if(valid.length >= 2){
          var stds = valid.map(function(c){ return c.std; });
          out.min = Math.min.apply(null, stds); out.max = Math.max.apply(null, stds);
          out.win = calc.findIndex(function(c){ return c.ok && c.std === out.min; });
          out.loss = calc.findIndex(function(c){ return c.ok && c.std === out.max; });
          out.same = out.max / out.min < 1.005;
          out.save = Math.round((out.max - out.min) / out.max * 100);
        }
        return out;
      }

      /* ---------- tampilan ---------- */
      function renderTabs(){
        L('bh-tabs').innerHTML = Object.keys(GROUPS).map(function(k){
          return '<button class="bh-tab' + (k === group ? ' on' : '') + '" data-g="' + k + '">' + GROUPS[k].label + '</button>';
        }).join('');
      }
      function rowHtml(r, i){
        var units = GROUPS[group].units.map(function(u){
          return '<option value="' + u[0] + '"' + (u[0] === r.unit ? ' selected' : '') + '>' + u[0] + '</option>';
        }).join('');
        return '<div class="bh-row" data-id="' + r.id + '">' +
          '<div class="bh-top"><input data-k="name" value="' + api.esc(r.name) + '" placeholder="Produk ' + LETTERS.charAt(i) + ' (nama opsional)" autocomplete="off">' +
          '<button class="bh-del" data-act="del" aria-label="Hapus produk">✕</button></div>' +
          '<div class="bh-grid">' +
            '<label><span>Harga (Rp)</span><input data-k="price" inputmode="numeric" value="' + api.esc(r.price) + '" placeholder="12000" autocomplete="off"></label>' +
            '<label><span>Jumlah paket</span><input data-k="qty" inputmode="numeric" value="' + api.esc(r.qty) + '" placeholder="1" autocomplete="off"></label>' +
            '<label><span>Isi per paket</span><input data-k="size" inputmode="decimal" value="' + api.esc(r.size) + '" placeholder="500" autocomplete="off"></label>' +
            '<label><span>Satuan</span><select data-k="unit">' + units + '</select></label>' +
          '</div><div class="bh-res"></div></div>';
      }
      function renderRows(){
        L('bh-list').innerHTML = rows.map(rowHtml).join('');
        L('bh-add').hidden = rows.length >= MAX_ROWS;
        update();
      }
      /* hanya memperbarui hasil (tanpa menggambar ulang kolom, supaya ketikan tidak terputus) */
      function update(){
        var a = analyse(), g = GROUPS[group];
        var els = L('bh-list').querySelectorAll('.bh-row');
        a.calc.forEach(function(c, i){
          var el = els[i]; if(!el) return;
          var res = el.querySelector('.bh-res');
          var isBest = c.ok && a.n >= 2 && c.std === a.min;
          el.classList.toggle('best', isBest);
          if(!c.ok){
            res.innerHTML = '<span class="bh-hint">Isi harga dan ukuran untuk menghitung</span>';
            return;
          }
          var badge = '';
          if(a.n >= 2){
            badge = isBest ? '<span class="bh-badge best">🏆 Termurah</span>'
              : '<span class="bh-badge more">lebih mahal ' + Math.round((c.std / a.min - 1) * 100) + '%</span>';
          }
          res.innerHTML = '<span class="bh-price">' + money(c.std) + ' / ' + g.stdLabel + '</span>' + badge +
            (c.alt ? '<span class="bh-alt">' + money(c.alt) + ' / ' + g.altLabel + '</span>' : '');
        });

        var sum = L('bh-sum');
        sum.classList.toggle('win', a.n >= 2 && !a.same);
        if(a.n < 2){
          sum.innerHTML = '<div class="bh-st">Isi minimal 2 produk</div><div class="bh-ss">Masukkan harga, jumlah paket, dan isi per paket. Hasil dibandingkan per ' + g.stdLabel + '.</div>';
        }else if(a.same){
          sum.innerHTML = '<div class="bh-st">Harganya hampir sama</div><div class="bh-ss">Selisih antar produk kurang dari 1% per ' + g.stdLabel + '.</div>';
        }else{
          sum.innerHTML = '<div class="bh-st">🏆 ' + api.esc(nameOf(a.win)) + ' paling hemat</div>' +
            '<div class="bh-ss">' + money(a.min) + ' per ' + g.stdLabel + ' — hemat ' + a.save + '% dibanding ' + api.esc(nameOf(a.loss)) + ' (' + money(a.max) + ').</div>';
        }
      }
      function dateLabel(t){ return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); }
      function renderHistory(){
        if(!history.length){ L('bh-hist').innerHTML = ''; return; }
        L('bh-hist').innerHTML = '<p class="bh-h2">Riwayat</p>' + history.map(function(h){
          var info = summarise(h);
          return '<div class="bh-h" data-id="' + h.id + '"><div class="bh-hm" data-act="load"><div class="bh-ht">' + api.esc(info.title) + '</div>' +
            '<div class="bh-hs">' + dateLabel(h.t) + ' · ' + h.rows.length + ' produk · ' + GROUPS[h.group].label + '</div></div>' +
            '<button class="bh-hd" data-act="hdel" aria-label="Hapus riwayat">✕</button></div>';
        }).join('');
      }
      /* ringkasan sebuah snapshot (dipakai untuk riwayat) */
      function summarise(h){
        var g = GROUPS[h.group], best = null, bestStd = Infinity, n = 0;
        h.rows.forEach(function(r, i){
          var price = parseNum(r.price), qty = parseNum(r.qty), size = parseNum(r.size);
          if(!(price > 0 && qty > 0 && size > 0)) return;
          n++;
          var std = price / (qty * size * unitFactor(h.group, r.unit)) * g.std;
          if(std < bestStd){ bestStd = std; best = ((r.name || '').trim()) || ('Produk ' + LETTERS.charAt(i)); }
        });
        return { title: best ? best + ' · ' + money(bestStd) + ' / ' + g.stdLabel : 'Perbandingan', n: n };
      }

      /* ---------- teks untuk dibagikan ---------- */
      function buildText(){
        var a = analyse(), g = GROUPS[group];
        var tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        var lines = ['⚖️ Banding harga — ' + tanggal, g.label + ' (per ' + g.stdLabel + ')', ''];
        a.calc.forEach(function(c, i){
          if(!c.ok) return;
          var r = rows[i];
          var star = (a.n >= 2 && c.std === a.min) ? '🏆 ' : '• ';
          var extra = (a.n >= 2 && c.std !== a.min) ? ', lebih mahal ' + Math.round((c.std / a.min - 1) * 100) + '%' : '';
          lines.push(star + nameOf(i) + ' — ' + money(c.std) + ' / ' + g.stdLabel + ' (' + money(parseNum(r.price)) + ' · ' + parseNum(r.qty) + '×' + r.size + ' ' + r.unit + extra + ')');
        });
        if(a.n >= 2 && !a.same) lines.push('', nameOf(a.win) + ' paling hemat, ' + a.save + '% lebih murah dibanding ' + nameOf(a.loss) + '.');
        return lines.join('\n');
      }

      /* ---------- event ---------- */
      L('bh-tabs').addEventListener('click', function(e){
        var b = e.target.closest('.bh-tab'); if(!b || b.dataset.g === group) return;
        group = b.dataset.g;
        rows.forEach(function(r){ r.unit = GROUPS[group].def; });
        persist(); renderTabs(); renderRows(); api.buzz(6);
      });
      function onField(e){
        var k = e.target.dataset && e.target.dataset.k; if(!k) return;
        var row = e.target.closest('.bh-row'); if(!row) return;
        var r = rows.filter(function(x){ return x.id === row.dataset.id; })[0]; if(!r) return;
        r[k] = e.target.value;
        persist(); update();
      }
      L('bh-list').addEventListener('input', onField);
      L('bh-list').addEventListener('change', onField);
      L('bh-list').addEventListener('click', function(e){
        var b = e.target.closest('[data-act="del"]'); if(!b) return;
        var id = b.closest('.bh-row').dataset.id;
        var snap = JSON.stringify(rows);
        if(rows.length > 2){
          rows = rows.filter(function(x){ return x.id !== id; });
        }else{
          rows = rows.map(function(x){ return x.id === id ? { id: x.id, name: '', price: '', qty: '1', size: '', unit: GROUPS[group].def } : x; });
        }
        persist(); renderRows(); api.buzz(10);
        api.toast('Produk dihapus', function(){ rows = JSON.parse(snap); persist(); renderRows(); });
      });
      L('bh-add').onclick = function(){
        if(rows.length >= MAX_ROWS) return;
        rows.push(newRow()); persist(); renderRows(); api.buzz(8);
        var els = L('bh-list').querySelectorAll('.bh-row');
        var last = els[els.length - 1];
        if(last){ var inp = last.querySelector('[data-k="name"]'); if(inp) inp.focus(); }
      };

      L('bh-share').onclick = function(){
        var text = buildText();
        if(navigator.share){ navigator.share({ text: text }).catch(function(){}); }
        else{ window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); }
      };
      L('bh-copy').onclick = function(){
        var text = buildText();
        var ok = function(){ api.toast('Hasil tersalin'); };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(ok, function(){ api.toast('Gagal menyalin'); });
        }else{
          var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
          try{ document.execCommand('copy'); ok(); }catch(err){ api.toast('Gagal menyalin'); }
          ta.remove();
        }
      };
      L('bh-save').onclick = function(){
        var a = analyse();
        if(a.n < 2){ api.toast('Isi minimal 2 produk dulu'); return; }
        history.unshift({ id: api.uid(), t: Date.now(), group: group, rows: JSON.parse(JSON.stringify(rows)) });
        history = history.slice(0, 20);
        persist(); renderHistory(); api.buzz(12); api.toast('Perbandingan disimpan ke riwayat');
      };
      L('bh-hist').addEventListener('click', function(e){
        var t = e.target.closest('[data-act]'); if(!t) return;
        var id = t.closest('.bh-h').dataset.id;
        var h = history.filter(function(x){ return x.id === id; })[0]; if(!h) return;
        if(t.dataset.act === 'load'){
          group = h.group;
          rows = h.rows.map(function(r){ var c = clean(r); c.id = api.uid(); return c; });
          persist(); renderTabs(); renderRows(); api.buzz(8); api.toast('Perbandingan dimuat');
          try{ window.scrollTo({ top: 0, behavior: 'smooth' }); }catch(err){ window.scrollTo(0, 0); }
        }else{
          var snap = JSON.stringify(history);
          history = history.filter(function(x){ return x.id !== id; });
          persist(); renderHistory(); api.buzz(10);
          api.toast('Riwayat dihapus', function(){ history = JSON.parse(snap); persist(); renderHistory(); });
        }
      });

      renderTabs(); renderRows(); renderHistory();

      return {
        menu: [
          { label: 'Kosongkan semua produk', run: function(){
              var snap = JSON.stringify(rows);
              rows = [newRow(), newRow()]; persist(); renderRows(); api.buzz(12);
              api.toast('Semua produk dikosongkan', function(){ rows = JSON.parse(snap); persist(); renderRows(); });
          } },
          { label: 'Hapus semua riwayat', danger: true, run: function(){
              if(!history.length) return;
              var snap = JSON.stringify(history);
              history = []; persist(); renderHistory(); api.buzz(20);
              api.toast('Riwayat dihapus', function(){ history = JSON.parse(snap); persist(); renderHistory(); });
          } }
        ],
        backup: {
          get: function(){ return { group: group, rows: rows, history: history }; },
          set: function(data){
            if(!data || !Array.isArray(data.history) || !GROUPS[data.group] || !Array.isArray(data.rows) || data.rows.length < 2) throw new Error('format salah');
            group = data.group;
            rows = data.rows.slice(0, MAX_ROWS).map(clean);
            history = data.history.filter(function(h){ return h && typeof h.id === 'string' && GROUPS[h.group] && Array.isArray(h.rows) && h.rows.length >= 2; });
            persist(); renderTabs(); renderRows(); renderHistory();
          },
          text: function(){ return buildText(); }
        }
      };
    }
  });

  if(typeof module !== 'undefined' && module.exports){ module.exports = { parseNum: parseNum, money: money }; }
})();
