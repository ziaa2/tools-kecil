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
  /* ---------- halaman utama: pencarian, favorit, riwayat ---------- */
  var hubState = { fav: [], recent: [] };
  var query = '';
  var SOON = '<div class="card soon"><div class="ic">＋</div><h3>Segera hadir</h3><p>Tool berikutnya</p></div>';

  function saveHub(){ store('hub').set(hubState); }
  function toolById(id){ return TOOLS.filter(function(t){ return t.id === id; })[0]; }
  function isFav(id){ return hubState.fav.indexOf(id) > -1; }
  function touchRecent(id){
    hubState.recent = [id].concat(hubState.recent.filter(function(x){ return x !== id; })).slice(0, 4);
    saveHub();
  }
  function toggleFav(id){
    if(isFav(id)) hubState.fav = hubState.fav.filter(function(x){ return x !== id; });
    else hubState.fav.push(id);
    saveHub(); buzz(8); renderHub();
  }
  function openTool(id){
    fromHub = true; buzz(8);
    location.hash = '#/' + id;
  }
  function matches(t, q){
    var hay = (t.title + ' ' + (t.desc || '') + ' ' + t.id + ' ' + (t.keywords || '')).toLowerCase();
    return q.split(/\s+/).every(function(w){ return hay.indexOf(w) > -1; });
  }
  function cardHtml(t){
    var badge = '';
    try{ badge = t.badge ? t.badge() : ''; }catch(e){}
    var f = isFav(t.id);
    return '<div class="card live" role="button" tabindex="0" data-id="' + esc(t.id) + '">' +
      '<button class="star' + (f ? ' on' : '') + '" data-star="' + esc(t.id) + '" aria-label="' + (f ? 'Hapus dari favorit' : 'Jadikan favorit') + '">' + (f ? '★' : '☆') + '</button>' +
      '<div class="ic">' + t.icon + '</div>' +
      (badge ? '<span class="badge">' + esc(badge) + '</span>' : '') +
      '<h3>' + esc(t.title) + '</h3></div>';
  }
  function chipHtml(t){
    return '<button class="rchip" data-open="' + esc(t.id) + '"><span>' + t.icon + '</span>' + esc(t.title) + '</button>';
  }
  function filteredTools(){
    var q = query.trim().toLowerCase();
    return q ? TOOLS.filter(function(t){ return matches(t, q); }) : [];
  }
  function renderHub(){
    var q = query.trim().toLowerCase(), html = '';
    if(q){
      var found = filteredTools();
      html = found.length
        ? '<p class="sec">' + found.length + ' hasil</p><div class="grid">' + found.map(cardHtml).join('') + '</div>'
        : '<div class="nores"><b>🔍</b>Tidak ada tool yang cocok.<br>Coba kata lain.</div>';
    }else{
      var recent = hubState.recent.map(toolById).filter(Boolean);
      var favs = hubState.fav.map(toolById).filter(Boolean);
      var rest = TOOLS.filter(function(t){ return !isFav(t.id); });
      if(recent.length){
        html += '<div class="sec">Terakhir dipakai<button class="sec-act" data-clear="recent">Hapus</button></div>' +
          '<div class="recent">' + recent.map(chipHtml).join('') + '</div>';
      }
      if(favs.length) html += '<p class="sec">⭐ Favorit</p><div class="grid">' + favs.map(cardHtml).join('') + '</div>';
      html += '<p class="sec">' + (favs.length ? 'Tool lainnya' : 'Semua tool') + '</p><div class="grid">' + rest.map(cardHtml).join('') + SOON + '</div>';
    }
    $('hubBody').innerHTML = html;
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
      query = ''; $('search').value = ''; $('searchClear').hidden = true;
      renderHub();
      show('hub');
      return;
    }
    touchRecent(tool.id);
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

    /* favorit & riwayat tersimpan */
    var hs = store('hub').get({});
    hubState = { fav: Array.isArray(hs.fav) ? hs.fav : [], recent: Array.isArray(hs.recent) ? hs.recent : [] };

    /* pencarian instan */
    $('search').addEventListener('input', function(){
      query = this.value;
      $('searchClear').hidden = !query;
      renderHub();
    });
    $('search').addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        var first = filteredTools()[0];
        if(first){ this.blur(); openTool(first.id); }
      }
    });
    $('searchClear').onclick = function(){
      query = ''; $('search').value = ''; this.hidden = true;
      renderHub(); $('search').focus();
    };

    /* kartu, bintang favorit, chip riwayat */
    $('hubBody').addEventListener('click', function(e){
      var s = e.target.closest('[data-star]');
      if(s){ toggleFav(s.dataset.star); return; }
      if(e.target.closest('[data-clear]')){ hubState.recent = []; saveHub(); renderHub(); return; }
      var r = e.target.closest('[data-open]');
      if(r){ openTool(r.dataset.open); return; }
      var c = e.target.closest('.card.live');
      if(c) openTool(c.dataset.id);
    });
    $('hubBody').addEventListener('keydown', function(e){
      if(e.key !== 'Enter' && e.key !== ' ') return;
      var c = e.target.closest('.card.live');
      if(c && e.target === c){ e.preventDefault(); openTool(c.dataset.id); }
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
