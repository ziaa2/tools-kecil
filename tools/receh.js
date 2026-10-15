/* =====================================================================
   TOOL: Catet Receh
   Pencet nominal (1k 2k 4k 5k 10k) → langsung tercatat.
   ===================================================================== */
(function(){
  var KEY = 'toolskecil:receh:v1';
  var NOMINAL = [1000, 2000, 4000, 5000, 10000];

  function dayKey(t){ var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function fmt(n){ return Math.round(n).toLocaleString('id-ID'); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function short(n){ return n >= 1000 && n % 1000 === 0 ? (n / 1000) + 'k' : fmt(n); }

  App.registerTool({
    id: 'receh',
    icon: '💰',
    title: 'Catet Receh',
    desc: 'Pencet nominalnya, langsung tercatat. Buat pengeluaran dadakan: parkir, jajan, uang kecil lainnya.',

    badge: function(){
      try{
        var e = JSON.parse(localStorage.getItem(KEY) || '[]');
        var k = dayKey(Date.now());
        var s = e.filter(function(x){ return dayKey(x.t) === k; }).reduce(function(a, x){ return a + x.amt; }, 0);
        return s ? 'Rp ' + fmt(s) + ' hari ini' : 'kosong';
      }catch(err){ return ''; }
    },

    css: '' +
      '.r-sum{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px;margin-bottom:14px}' +
      '.r-lab{color:var(--muted);font-size:13px}' +
      '.r-big{font-size:34px;font-weight:650;letter-spacing:-.8px;margin:4px 0 2px}' +
      '.r-big.pulse{animation:rpulse .25s ease}' +
      '@keyframes rpulse{50%{transform:scale(1.04);color:var(--accent)}}' +
      '.r-sub{color:var(--muted);font-size:13px}' +
      '.r-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}' +
      '.r-btn{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);height:76px;font-size:24px;font-weight:600;transition:transform .1s,background .15s,border-color .15s}' +
      '.r-btn:active{transform:scale(.94);background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}' +
      '.r-btn.o{color:var(--muted);font-size:15px;font-weight:500}' +
      '.r-custom{display:flex;gap:8px;background:var(--surface2);border:1px solid var(--line);border-radius:18px;padding:6px;margin-bottom:24px}' +
      '.r-custom:focus-within{border-color:var(--accent)}' +
      '.r-custom input{flex:1;min-width:0;background:none;border:0;outline:0;padding:10px 8px}' +
      '.r-custom button{padding:0 18px;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-weight:600}' +
      '.r-h{color:var(--muted);font-size:12px;letter-spacing:.4px;text-transform:uppercase;margin:0 0 8px 4px}' +
      '.r-list{list-style:none;margin:0 0 24px;padding:0;display:flex;flex-direction:column;gap:6px}' +
      '.r-row{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px 6px 6px 14px}' +
      '.r-row.new{animation:rpop .2s ease}' +
      '@keyframes rpop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}' +
      '.r-time{color:var(--muted);font-size:13px;width:44px;flex:none}' +
      '.r-amt{flex:1;font-size:16px}' +
      '.r-del{width:38px;height:38px;border-radius:10px;color:var(--muted);font-size:17px;display:grid;place-items:center}' +
      '.r-del:active{background:var(--surface2);color:var(--danger)}' +
      '.r-day{display:flex;justify-content:space-between;padding:11px 14px;color:var(--muted);font-size:14px;border-bottom:1px solid var(--line)}' +
      '.r-day b{color:var(--text);font-weight:500}' +
      '.r-empty{text-align:center;color:var(--muted);padding:26px 10px;font-size:14px}',

    mount: function(root, api){
      var st = api.store('receh');
      var entries = st.get([]);          // [{id, t, amt}]
      var justAdded = null;

      root.innerHTML =
        '<div class="r-sum"><div class="r-lab">Hari ini</div><div class="r-big" id="r-total">Rp 0</div><div class="r-sub" id="r-count"></div></div>' +
        '<div class="r-grid" id="r-grid">' +
          NOMINAL.map(function(n){ return '<button class="r-btn" data-v="' + n + '">' + short(n) + '</button>'; }).join('') +
          '<button class="r-btn o" id="r-other">✎ Lain</button>' +
        '</div>' +
        '<div class="r-custom"><input id="r-in" inputmode="numeric" placeholder="Nominal lain, mis. 3000 atau 3k" enterkeyhint="done"><button id="r-add">Catat</button></div>' +
        '<p class="r-h">Hari ini</p><ul class="r-list" id="r-list"></ul>' +
        '<div id="r-prev"></div>';

      var L = function(id){ return root.querySelector('#' + id); };
      var tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      function todayList(){ var k = dayKey(Date.now()); return entries.filter(function(e){ return dayKey(e.t) === k; }); }
      function sum(list){ return list.reduce(function(a, e){ return a + e.amt; }, 0); }
      function hm(t){ var d = new Date(t); return pad(d.getHours()) + '.' + pad(d.getMinutes()); }

      function render(pulse){
        var td = todayList().sort(function(a, b){ return b.t - a.t; });
        L('r-total').textContent = api.rp(sum(td));
        L('r-count').textContent = td.length + ' catatan';
        if(pulse){
          var el = L('r-total'); el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
        }
        L('r-list').innerHTML = td.length ? td.map(function(e){
          return '<li class="r-row' + (e.id === justAdded ? ' new' : '') + '" data-id="' + e.id + '">' +
            '<span class="r-time">' + hm(e.t) + '</span><span class="r-amt">' + api.rp(e.amt) + '</span>' +
            '<button class="r-del" aria-label="Hapus">✕</button></li>';
        }).join('') : '<li class="r-empty">Belum ada pengeluaran hari ini.<br>Pencet nominal di atas.</li>';
        justAdded = null;

        /* hari-hari sebelumnya (7 hari terakhir yang ada catatan) */
        var tk = dayKey(Date.now()), days = {}, order = [];
        entries.forEach(function(e){
          var k = dayKey(e.t); if(k === tk) return;
          if(!days[k]){ days[k] = { t: e.t, total: 0 }; order.push(k); }
          days[k].total += e.amt;
        });
        order.sort(function(a, b){ return days[b].t - days[a].t; });
        order = order.slice(0, 7);
        L('r-prev').innerHTML = order.length ? '<p class="r-h">Hari sebelumnya</p>' + order.map(function(k){
          var d = new Date(days[k].t);
          var lab = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
          return '<div class="r-day"><span>' + lab + '</span><b>' + api.rp(days[k].total) + '</b></div>';
        }).join('') : '';
      }
      function commit(pulse){ st.set(entries); render(pulse); }

      function record(amt){
        if(!(amt > 0)) return;
        var e = { id: api.uid(), t: Date.now(), amt: amt };
        entries.push(e); justAdded = e.id;
        commit(true); api.buzz(12);
        api.toast(api.rp(amt) + ' dicatat', function(){
          entries = entries.filter(function(x){ return x.id !== e.id; }); commit();
        });
      }
      function parseAmt(s){
        s = String(s).trim().toLowerCase().replace(/\./g, '').replace(/rp/g, '').replace(/\s+/g, '');
        var m = s.match(/^(\d+)(k|rb)$/);
        if(m) return parseInt(m[1], 10) * 1000;
        return parseInt(s.replace(/\D/g, ''), 10) || 0;
      }

      L('r-grid').addEventListener('click', function(e){
        var b = e.target.closest('.r-btn'); if(!b) return;
        if(b.id === 'r-other'){ L('r-in').focus(); return; }
        record(parseInt(b.dataset.v, 10));
      });
      function addCustom(){
        var v = parseAmt(L('r-in').value);
        if(!(v > 0)){ L('r-in').focus(); return; }
        L('r-in').value = ''; record(v);
      }
      L('r-add').onclick = addCustom;
      L('r-in').addEventListener('keydown', function(e){ if(e.key === 'Enter') addCustom(); });

      L('r-list').addEventListener('click', function(e){
        var b = e.target.closest('.r-del'); if(!b) return;
        var id = b.closest('.r-row').dataset.id;
        var snap = JSON.stringify(entries);
        entries = entries.filter(function(x){ return x.id !== id; });
        commit(); api.buzz(10);
        api.toast('Catatan dihapus', function(){ entries = JSON.parse(snap); commit(); });
      });

      render();

      return {
        menu: [
          { label: 'Hapus catatan hari ini', danger: true, run: function(){
              var snap = JSON.stringify(entries), k = dayKey(Date.now());
              entries = entries.filter(function(e){ return dayKey(e.t) !== k; });
              commit(); api.toast('Catatan hari ini dihapus', function(){ entries = JSON.parse(snap); commit(); });
          } },
          { label: 'Reset semua catatan', danger: true, run: function(){
              if(!entries.length) return;
              var snap = JSON.stringify(entries);
              entries = []; commit(); api.buzz(20);
              api.toast('Semua catatan di-reset', function(){ entries = JSON.parse(snap); commit(); });
          } }
        ],
        backup: {
          get: function(){ return entries; },
          set: function(data){
            if(!Array.isArray(data) || data.some(function(e){ return !e || typeof e.amt !== 'number' || typeof e.t !== 'number'; })) throw new Error('format salah');
            entries = data; commit();
          },
          text: function(){
            var td = todayList().sort(function(a, b){ return a.t - b.t; });
            var lines = ['💰 Pengeluaran receh — ' + tanggal, ''];
            td.forEach(function(e){ lines.push(hm(e.t) + '  ' + api.rp(e.amt)); });
            lines.push('', 'Total hari ini: ' + api.rp(sum(td)));
            return lines.join('\n');
          }
        }
      };
    }
  });
})();
