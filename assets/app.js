/* =====================================================================
   TOOLS KECIL — mesin utama
   - App.registerTool({...})  : daftarkan tool baru (lihat README.md)
   - Router sederhana berbasis hash (#/belanja)
   - Menu ⋯ otomatis: aksi tool + Backup & bagikan
   Tanpa PWA, tanpa server, tanpa library luar.
   ===================================================================== */
(function(){
  'use strict';

  var TOOLS = [];
  var current = null;
  var fromHub = false;
  var toastTimer = null;
  var undoFn = null;

  var $ = function(id){ return document.getElementById(id); };
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function rp(n){ return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }
  function buzz(ms){ try{ navigator.vibrate && navigator.vibrate(ms || 10); }catch(e){} }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function today(){
    var d = new Date();
    var p = function(n){ return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /* ---------- penyimpanan per tool (localStorage) ---------- */
  function store(id){
    var key = 'toolskecil:' + id + ':v1';
    return {
      get: function(def){
        try{ var r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }catch(e){ return def; }
      },
      set: function(v){
        try{ localStorage.setItem(key, JSON.stringify(v)); }catch(e){}
      }
    };
  }

  /* ---------- toast ---------- */
  function toast(msg, onUndo){
    undoFn = onUndo || null;
    $('toastMsg').textContent = msg;
    $('undo').hidden = !onUndo;
    $('toast').classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ $('toast').classList.remove('on'); }, 4500);
  }

  /* ---------- backup: download, kirim, pulihkan ---------- */
  function downloadFile(filename, text){
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  function envelope(tool){
    return { app: 'tools-kecil', tool: tool.id, version: 1, savedAt: new Date().toISOString(), data: tool.backup.get() };
  }
  function backupText(tool){
    return tool.backup.text ? tool.backup.text() : JSON.stringify(envelope(tool));
  }
  function pickRestore(tool){
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = function(){
      var f = inp.files && inp.files[0]; if(!f) return;
      var r = new FileReader();
      r.onload = function(){
        try{
          var env = JSON.parse(r.result);
          if(!env || env.app !== 'tools-kecil' || env.tool !== tool.id) throw new Error('beda tool');
          var before = tool.backup.get();
          tool.backup.set(env.data);
          toast('Backup berhasil dipulihkan', function(){ tool.backup.set(before); });
        }catch(e){
          toast('File backup tidak cocok untuk tool ini');
        }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  var api = { store: store, toast: toast, esc: esc, rp: rp, buzz: buzz, uid: uid, today: today };

  /* ---------- registry ---------- */
  function registerTool(t){
    TOOLS.push(t);
    if(t.css){
      var s = document.createElement('style');
      s.textContent = t.css;
      document.head.appendChild(s);
    }
  }

  /* ---------- tampilan ---------- */
  function show(id){
    document.querySelectorAll('.view').forEach(function(v){ v.classList.toggle('on', v.id === id); });
    window.scrollTo(0, 0);
  }
  function renderHub(){
    var html = TOOLS.map(function(t){
      var badge = '';
      try{ badge = t.badge ? t.badge() : ''; }catch(e){}
      return '<button class="card live" data-id="' + esc(t.id) + '"><div class="ic">' + t.icon + '</div>' +
        (badge ? '<span class="badge">' + esc(badge) + '</span>' : '') +
        '<h3>' + esc(t.title) + '</h3></button>';
    }).join('');
    html += '<div class="card soon"><div class="ic">＋</div><h3>Segera hadir</h3><p>Tool berikutnya</p></div>';
    $('grid').innerHTML = html;
  }

  /* ---------- menu ⋯ ---------- */
  function sheet(on){
    $('sheet').classList.toggle('on', on);
    $('scrim').classList.toggle('on', on);
  }
  function addOpt(box, label, fn, danger){
    var b = document.createElement('button');
    b.className = 'opt' + (danger ? ' danger' : '');
    b.textContent = label;
    b.onclick = function(){ sheet(false); fn(); };
    box.appendChild(b);
  }
  function addText(box, cls, text){
    var d = document.createElement('div');
    d.className = cls; d.textContent = text;
    box.appendChild(d);
  }
  function openMenu(){
    if(!current) return;
    var box = $('sheetBox');
    box.innerHTML = '';
    addText(box, 't', 'Menu');

    (current.menu || []).forEach(function(m){ addOpt(box, m.label, m.run, m.danger); });

    if(current.backup){
      var tool = current.tool;
      addText(box, 'sec', 'Backup & bagikan');
      addText(box, 'note', 'Data disimpan di browser HP ini. Kalau data browser terhapus, catatan bisa hilang — simpan backup biar aman.');
      addOpt(box, '⬇️  Download file backup', function(){
        downloadFile(tool.id + '-' + today() + '.json', JSON.stringify(envelope({ id: tool.id, backup: current.backup }), null, 2));
        toast('File backup tersimpan di HP');
      });
      addOpt(box, '💬  Kirim ke WhatsApp', function(){
        window.open('https://wa.me/?text=' + encodeURIComponent(backupText({ id: tool.id, backup: current.backup })), '_blank');
      });
      if(navigator.share){
        addOpt(box, '↗️  Bagikan ke aplikasi lain', function(){
          navigator.share({ title: tool.title, text: backupText({ id: tool.id, backup: current.backup }) }).catch(function(){});
        });
      }
      addOpt(box, '⬆️  Pulihkan dari file backup', function(){ pickRestore({ id: tool.id, backup: current.backup }); });
    }

    var c = document.createElement('button');
    c.className = 'opt cancel'; c.textContent = 'Batal';
    c.onclick = function(){ sheet(false); };
    box.appendChild(c);
    sheet(true);
  }

  /* ---------- router ---------- */
  function route(){
    if(current && current.destroy) current.destroy();
    current = null;
    sheet(false);

    var m = location.hash.match(/^#\/(\w+)/);
    var tool = m && TOOLS.filter(function(t){ return t.id === m[1]; })[0];
    if(!tool){
      fromHub = false;
      renderHub();
      show('hub');
      return;
    }
    $('toolTitle').textContent = tool.title;
    $('toolDesc').textContent = tool.desc || '';
    $('toolBody').innerHTML = '';
    var inst = tool.mount($('toolBody'), api) || {};
    current = { tool: tool, menu: inst.menu, backup: inst.backup, destroy: inst.destroy };
    $('menuBtn').style.visibility = (inst.menu || inst.backup) ? 'visible' : 'hidden';
    show('tool');
  }

  function start(){
    /* tombol donasi (opsional, diatur di config.js) */
    var url = window.SITE && window.SITE.saweria;
    if(url){ $('donate').href = url; $('donate').hidden = false; }

    $('grid').addEventListener('click', function(e){
      var c = e.target.closest('.card.live'); if(!c) return;
      fromHub = true; buzz(8);
      location.hash = '#/' + c.dataset.id;
    });
    $('back').onclick = function(){ if(fromHub){ history.back(); } else { location.replace('#/'); } };
    $('menuBtn').onclick = openMenu;
    $('scrim').onclick = function(){ sheet(false); };
    $('undo').onclick = function(){ if(undoFn) undoFn(); $('toast').classList.remove('on'); };
    window.addEventListener('hashchange', route);
    route();
  }

  window.App = { registerTool: registerTool, start: start };
})();
