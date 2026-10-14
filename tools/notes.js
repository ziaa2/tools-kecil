/* =====================================================================
   TOOL: Quick Notes
   Catat cepat, sematkan, cari, edit, salin. Link otomatis bisa diketuk.
   ===================================================================== */
(function(){
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function dayKey(d){ return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function when(t){
    var d = new Date(t), now = new Date();
    var hm = pad(d.getHours()) + '.' + pad(d.getMinutes());
    if(dayKey(d) === dayKey(now)) return hm;
    var y = new Date(now.getTime() - 86400000);
    if(dayKey(d) === dayKey(y)) return 'Kemarin ' + hm;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + hm;
  }

  App.registerTool({
    id: 'notes',
    icon: '📝',
    title: 'Quick Notes',
    desc: 'Catat ide, pesan, atau apa saja secepat kilat. Sematkan yang penting, cari kapan saja. Data tersimpan di HP kamu.',

    badge: function(){
      try{
        var n = JSON.parse(localStorage.getItem('toolskecil:notes:v1') || '[]').length;
        return n ? n + ' catatan' : 'kosong';
      }catch(e){ return ''; }
    },

    css: '' +
      '.n-search{margin-bottom:12px}' +
      '.n-search input{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:11px 14px;outline:0;font-size:16px}' +
      '.n-search input:focus{border-color:var(--accent)}' +
      '.n-list{display:flex;flex-direction:column;gap:10px}' +
      '.n-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px 12px 8px 14px}' +
      '.n-card.pin{border-color:rgba(94,234,212,.45)}' +
      '.n-card.new{animation:npop .22s ease}' +
      '@keyframes npop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}' +
      '.n-txt{white-space:pre-wrap;word-break:break-word;font-size:16px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:8;-webkit-box-orient:vertical;overflow:hidden}' +
      '.n-txt a{color:var(--accent)}' +
      '.n-foot{display:flex;align-items:center;justify-content:space-between;margin-top:8px}' +
      '.n-time{color:var(--muted);font-size:12px}' +
      '.n-ac{display:flex;gap:2px}' +
      '.n-ac button{width:38px;height:36px;border-radius:10px;color:var(--muted);font-size:16px;display:grid;place-items:center}' +
      '.n-ac button:active{background:var(--surface2)}' +
      '.n-ac button.on{color:var(--accent)}' +
      '.n-ac button.d:active{color:var(--danger)}' +
      '.n-ed{width:100%;background:var(--surface2);border:1px solid var(--accent);border-radius:12px;padding:10px;outline:0;resize:none;font:inherit;font-size:16px;line-height:1.45;color:var(--text);min-height:90px;max-height:50vh}' +
      '.n-edact{display:flex;gap:8px;justify-content:flex-end;margin:8px 0 4px}' +
      '.n-edact button{padding:10px 16px;border-radius:12px;background:var(--surface2);font-size:15px}' +
      '.n-edact .pri{background:var(--accent);color:var(--accent-ink);font-weight:600}' +
      '.n-empty{text-align:center;color:var(--muted);padding:44px 10px;font-size:15px;line-height:1.5}' +
      '.n-empty b{display:block;font-size:38px;margin-bottom:8px;font-weight:400}' +
      '.n-bar{position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line);z-index:5}' +
      '.n-in{max-width:480px;margin:0 auto;display:flex;gap:8px;align-items:flex-end;background:var(--surface2);border:1px solid var(--line);border-radius:18px;padding:6px}' +
      '.n-in:focus-within{border-color:var(--accent)}' +
      '.n-in textarea{flex:1;min-width:0;background:none;border:0;outline:0;resize:none;padding:11px 8px;font:inherit;font-size:16px;line-height:1.35;color:var(--text);max-height:120px}' +
      '.n-add{width:46px;height:46px;flex:none;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:24px;font-weight:600;display:grid;place-items:center}' +
      '.n-add:active{transform:scale(.92)}',

    mount: function(root, api){
      var st = api.store('notes');
      var notes = st.get([]);          // [{id, t, text, pin}]
      var q = '', editing = null, justAdded = null;
      var tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      root.innerHTML =
        '<div class="n-search" id="n-sw"><input id="n-q" placeholder="Cari catatan…" autocomplete="off"></div>' +
        '<div class="n-list" id="n-list"></div>' +
        '<div class="n-bar"><div class="n-in"><textarea id="n-new" rows="1" placeholder="Tulis catatan…"></textarea>' +
        '<button class="n-add" id="n-add" aria-label="Simpan">+</button></div></div>';

      var L = function(id){ return root.querySelector('#' + id); };
      function grow(ta){ ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
      function rich(s){
        return api.esc(s).replace(/(https?:\/\/[^\s<]+)/g, function(u){
          return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>';
        });
      }
      function find(id){ return notes.filter(function(n){ return n.id === id; })[0]; }

      function render(){
        L('n-sw').hidden = !notes.length;
        var list = notes.filter(function(n){ return !q || n.text.toLowerCase().indexOf(q) > -1; })
          .sort(function(a, b){ return ((b.pin ? 1 : 0) - (a.pin ? 1 : 0)) || (b.t - a.t); });
        var box = L('n-list');
        if(!notes.length){
          box.innerHTML = '<div class="n-empty"><b>🗒️</b>Belum ada catatan.<br>Tulis di bawah, lalu tekan +.</div>';
        }else if(!list.length){
          box.innerHTML = '<div class="n-empty">Tidak ada yang cocok.</div>';
        }else{
          box.innerHTML = list.map(function(n){
            if(n.id === editing){
              return '<div class="n-card" data-id="' + n.id + '"><textarea class="n-ed" id="n-ed">' + api.esc(n.text) + '</textarea>' +
                '<div class="n-edact"><button data-act="cancel">Batal</button><button class="pri" data-act="save">Simpan</button></div></div>';
            }
            return '<div class="n-card' + (n.pin ? ' pin' : '') + (n.id === justAdded ? ' new' : '') + '" data-id="' + n.id + '">' +
              '<div class="n-txt" data-act="edit">' + rich(n.text) + '</div>' +
              '<div class="n-foot"><span class="n-time">' + (n.pin ? '📌 ' : '') + when(n.t) + '</span><span class="n-ac">' +
              '<button class="' + (n.pin ? 'on' : '') + '" data-act="pin" aria-label="Sematkan">📌</button>' +
              '<button data-act="cp" aria-label="Salin">📋</button>' +
              '<button class="d" data-act="del" aria-label="Hapus">✕</button></span></div></div>';
          }).join('');
          var ed = L('n-ed');
          if(ed){ grow(ed); ed.focus(); ed.setSelectionRange(ed.value.length, ed.value.length); ed.addEventListener('input', function(){ grow(ed); }); }
        }
        justAdded = null;
      }
      function commit(){ st.set(notes); render(); }

      /* simpan editan yang sedang terbuka (kalau ada) sebelum pindah aksi */
      function flushEdit(){
        if(!editing) return;
        var ed = L('n-ed'), n = find(editing);
        if(ed && n && ed.value.trim()) n.text = ed.value.trim();
        editing = null;
      }

      function add(){
        var ta = L('n-new'), v = ta.value.trim();
        if(!v){ ta.focus(); return; }
        flushEdit();
        var n = { id: api.uid(), t: Date.now(), text: v, pin: false };
        notes.unshift(n); justAdded = n.id;
        ta.value = ''; grow(ta);
        commit(); api.buzz(12); ta.focus();
      }
      L('n-add').onclick = add;
      L('n-new').addEventListener('input', function(){ grow(this); });
      L('n-q').addEventListener('input', function(){ q = this.value.trim().toLowerCase(); flushEdit(); render(); });

      L('n-list').addEventListener('click', function(e){
        if(e.target.closest('a')) return;                       // ketuk link = buka link
        var t = e.target.closest('[data-act]'); if(!t) return;
        var card = t.closest('.n-card'); if(!card) return;
        var id = card.dataset.id, n = find(id), act = t.dataset.act;
        if(!n) return;
        if(act === 'edit'){
          flushEdit(); editing = id; render();
        }else if(act === 'save'){
          var ed = L('n-ed'), v = ed ? ed.value.trim() : '';
          if(!v){ api.toast('Catatan tidak boleh kosong'); return; }
          n.text = v; editing = null; commit(); api.buzz(8);
        }else if(act === 'cancel'){
          editing = null; render();
        }else if(act === 'pin'){
          flushEdit(); n.pin = !n.pin; commit(); api.buzz(8);
        }else if(act === 'cp'){
          var done = function(){ api.toast('Catatan tersalin'); };
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(n.text).then(done, function(){ api.toast('Gagal menyalin'); });
          }else{
            var ta = document.createElement('textarea'); ta.value = n.text; document.body.appendChild(ta); ta.select();
            try{ document.execCommand('copy'); done(); }catch(err){ api.toast('Gagal menyalin'); }
            ta.remove();
          }
        }else if(act === 'del'){
          var snap = JSON.stringify(notes);
          notes = notes.filter(function(x){ return x.id !== id; });
          if(editing === id) editing = null;
          commit(); api.buzz(10);
          api.toast('Catatan dihapus', function(){ notes = JSON.parse(snap); commit(); });
        }
      });

      render();

      return {
        menu: [
          { label: 'Hapus semua catatan', danger: true, run: function(){
              if(!notes.length) return;
              var snap = JSON.stringify(notes);
              notes = []; editing = null; commit(); api.buzz(20);
              api.toast('Semua catatan dihapus', function(){ notes = JSON.parse(snap); commit(); });
          } }
        ],
        backup: {
          get: function(){ return notes; },
          set: function(data){
            if(!Array.isArray(data) || data.some(function(n){ return !n || typeof n.text !== 'string' || typeof n.t !== 'number'; })) throw new Error('format salah');
            notes = data; editing = null; commit();
          },
          text: function(){
            var sorted = notes.slice().sort(function(a, b){ return ((b.pin ? 1 : 0) - (a.pin ? 1 : 0)) || (b.t - a.t); });
            return '📝 Catatan — ' + tanggal + '\n\n' + sorted.map(function(n){
              return (n.pin ? '📌 ' : '') + n.text + '\n(' + when(n.t) + ')';
            }).join('\n\n———\n\n');
          }
        }
      };
    }
  });
})();
