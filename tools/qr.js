/* =====================================================================
   TOOL: QR Code & Link
   Mode: Teks/Link, WhatsApp, Wi-Fi, Email → QR + link siap bagikan.
   Butuh: assets/qrcode.js
   ===================================================================== */
App.registerTool({
  id: 'qr',
  icon: '🔳',
  title: 'QR Code & Link',
  desc: 'Bikin QR code dan link siap bagikan: teks/link, WhatsApp, Wi-Fi, atau email. Diproses di HP kamu, tidak ada data yang dikirim.',

  css: '' +
    '.q-tabs{display:flex;gap:6px;overflow-x:auto;margin:0 0 16px;scrollbar-width:none}' +
    '.q-tabs::-webkit-scrollbar{display:none}' +
    '.q-tab{flex:none;padding:9px 15px;border-radius:99px;border:1px solid var(--line);background:var(--surface);color:var(--muted);font-size:14px}' +
    '.q-tab.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}' +
    '.q-f{display:block;margin-bottom:12px}' +
    '.q-f span{display:block;color:var(--muted);font-size:12.5px;margin:0 0 6px 4px}' +
    '.q-f input,.q-f textarea,.q-f select{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:12px;outline:0;font:inherit;font-size:16px;color:var(--text)}' +
    '.q-f textarea{resize:none;min-height:78px}' +
    '.q-f input:focus,.q-f textarea:focus,.q-f select:focus{border-color:var(--accent)}' +
    '.q-empty{text-align:center;color:var(--muted);padding:34px 10px;font-size:14px;line-height:1.5}' +
    '.q-empty b{display:block;font-size:34px;margin-bottom:6px;font-weight:400}' +
    '.q-card{background:#fff;border-radius:20px;padding:14px;width:min(100%,300px);margin:10px auto 12px}' +
    '.q-card canvas{display:block;width:100%;height:auto;image-rendering:pixelated}' +
    '.q-val{text-align:center;color:var(--muted);font-size:12.5px;word-break:break-all;margin:0 4px 14px;max-height:4.6em;overflow:hidden}' +
    '.q-err{text-align:center;color:var(--danger);font-size:14px;padding:24px 10px}' +
    '.q-act{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}' +
    '.q-act button,.q-act a{display:block;text-align:center;text-decoration:none;color:var(--text);background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 8px;font-size:15px}' +
    '.q-act button:active,.q-act a:active{background:var(--surface2)}' +
    '.q-act .pri{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}',

  mount: function(root, api){
    var st = api.store('qr');
    var s = st.get({ mode: 'link', f: {} });
    if(!s.f) s.f = {};
    var timer = null;

    var MODES = [
      { id: 'link', label: 'Teks / Link' },
      { id: 'wa',   label: 'WhatsApp' },
      { id: 'wifi', label: 'Wi-Fi' },
      { id: 'mail', label: 'Email' }
    ];
    var FIELDS = {
      link: [{ k: 'text', label: 'Teks atau link', type: 'area', ph: 'https://…  atau teks apa saja' }],
      wa:   [{ k: 'num', label: 'Nomor WhatsApp', ph: '08123456789', mode: 'tel' },
             { k: 'msg', label: 'Pesan (opsional)', type: 'area', ph: 'Halo, saya mau tanya…' }],
      wifi: [{ k: 'ssid', label: 'Nama Wi-Fi (SSID)', ph: 'RumahKu' },
             { k: 'pass', label: 'Password', ph: '' },
             { k: 'sec', label: 'Keamanan', type: 'select', opts: [['WPA', 'WPA / WPA2 / WPA3'], ['WEP', 'WEP'], ['nopass', 'Tanpa password']] }],
      mail: [{ k: 'to', label: 'Alamat email', ph: 'nama@email.com', mode: 'email' },
             { k: 'sub', label: 'Subjek (opsional)' },
             { k: 'body', label: 'Isi (opsional)', type: 'area' }]
    };

    root.innerHTML =
      '<div class="q-tabs" id="q-tabs"></div>' +
      '<div id="q-form"></div>' +
      '<div id="q-out"></div>';
    var L = function(id){ return root.querySelector('#' + id); };
    var current = null;   // {value, isLink}

    /* ---------- bentuk isi QR / link dari form ---------- */
    function build(mode, f){
      f = f || {};
      var t, v;
      if(mode === 'link'){
        t = (f.text || '').trim();
        if(!t) return null;
        if(/^[a-z][a-z0-9+.-]*:/i.test(t)) return { value: t, isLink: /^(https?|mailto|tel):/i.test(t) };
        if(/^[\w-]+(\.[\w-]+)+(:\d+)?([\/?#]\S*)?$/.test(t)) return { value: 'https://' + t, isLink: true };
        return { value: t, isLink: false };
      }
      if(mode === 'wa'){
        v = (f.num || '').replace(/\D/g, '');
        if(v.charAt(0) === '0') v = '62' + v.slice(1);
        else if(v.charAt(0) === '8') v = '62' + v;
        if(v.length < 8) return null;
        var msg = (f.msg || '').trim();
        return { value: 'https://wa.me/' + v + (msg ? '?text=' + encodeURIComponent(msg) : ''), isLink: true };
      }
      if(mode === 'wifi'){
        var ssid = (f.ssid || '').trim();
        if(!ssid) return null;
        var esc = function(x){ return x.replace(/([\\;,:"])/g, '\\$1'); };
        var sec = f.sec || 'WPA';
        if(sec === 'nopass') return { value: 'WIFI:T:nopass;S:' + esc(ssid) + ';;', isLink: false };
        return { value: 'WIFI:T:' + sec + ';S:' + esc(ssid) + ';P:' + esc(f.pass || '') + ';;', isLink: false };
      }
      if(mode === 'mail'){
        var to = (f.to || '').trim();
        if(to.indexOf('@') < 1) return null;
        var q = [];
        if((f.sub || '').trim()) q.push('subject=' + encodeURIComponent(f.sub.trim()));
        if((f.body || '').trim()) q.push('body=' + encodeURIComponent(f.body.trim()));
        return { value: 'mailto:' + to + (q.length ? '?' + q.join('&') : ''), isLink: true };
      }
      return null;
    }

    /* ---------- gambar QR ke canvas ---------- */
    function draw(cv, qr){
      var quiet = 4, n = qr.size;
      var sc = Math.max(4, Math.floor(720 / (n + quiet * 2)));
      var px = (n + quiet * 2) * sc;
      cv.width = cv.height = px;
      var c = cv.getContext('2d');
      c.fillStyle = '#fff'; c.fillRect(0, 0, px, px);
      c.fillStyle = '#000';
      for(var y = 0; y < n; y++) for(var x = 0; x < n; x++){
        if(qr.get(x, y)) c.fillRect((x + quiet) * sc, (y + quiet) * sc, sc, sc);
      }
    }

    function render(){
      var out = L('q-out');
      current = build(s.mode, s.f[s.mode]);
      if(!current){
        out.innerHTML = '<div class="q-empty"><b>🔳</b>Isi data di atas,<br>QR code langsung muncul.</div>';
        return;
      }
      var qr;
      var errMsg = '';
      if(typeof QRCode === 'undefined'){
        errMsg = 'File <b>assets/qrcode.js</b> belum terpasang atau gagal dimuat. Pastikan sudah diunggah dan ada di <b>index.html</b>.';
      }else{
        try{ qr = QRCode.encode(current.value, 'M'); }
        catch(e){
          errMsg = /panjang/i.test(e && e.message) ? 'Teks terlalu panjang untuk dijadikan QR.' : 'Gagal membuat QR: ' + api.esc((e && e.message) || e);
        }
      }
      if(errMsg){ out.innerHTML = '<div class="q-err">' + errMsg + '</div>'; current = null; return; }

      out.innerHTML =
        '<div class="q-card"><canvas id="q-cv" aria-label="QR code"></canvas></div>' +
        '<div class="q-val">' + api.esc(current.value) + '</div>' +
        '<div class="q-act">' +
          '<button class="pri" id="q-dl">⬇️ Unduh PNG</button>' +
          '<button id="q-sh">↗️ Bagikan</button>' +
          '<button id="q-cp">📋 Salin ' + (current.isLink ? 'link' : 'isi') + '</button>' +
          (current.isLink ? '<a id="q-open" href="' + api.esc(current.value) + '" target="_blank" rel="noopener noreferrer">🔗 Buka</a>' : '') +
        '</div>';
      draw(L('q-cv'), qr);
    }

    /* ---------- tab & form ---------- */
    function renderTabs(){
      L('q-tabs').innerHTML = MODES.map(function(m){
        return '<button class="q-tab' + (m.id === s.mode ? ' on' : '') + '" data-m="' + m.id + '">' + m.label + '</button>';
      }).join('');
    }
    function renderForm(){
      var vals = s.f[s.mode] || {};
      L('q-form').innerHTML = FIELDS[s.mode].map(function(fd){
        var v = vals[fd.k] || '', input;
        if(fd.type === 'area'){
          input = '<textarea data-k="' + fd.k + '" placeholder="' + api.esc(fd.ph || '') + '">' + api.esc(v) + '</textarea>';
        }else if(fd.type === 'select'){
          input = '<select data-k="' + fd.k + '">' + fd.opts.map(function(o){
            return '<option value="' + o[0] + '"' + ((v || fd.opts[0][0]) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
          }).join('') + '</select>';
        }else{
          input = '<input data-k="' + fd.k + '" value="' + api.esc(v) + '" placeholder="' + api.esc(fd.ph || '') + '"' +
            (fd.mode ? ' inputmode="' + fd.mode + '"' : '') + ' autocomplete="off">';
        }
        return '<label class="q-f"><span>' + fd.label + '</span>' + input + '</label>';
      }).join('');
    }

    L('q-tabs').addEventListener('click', function(e){
      var b = e.target.closest('.q-tab'); if(!b) return;
      s.mode = b.dataset.m; st.set(s);
      renderTabs(); renderForm(); render(); api.buzz(6);
    });
    function onField(e){
      var k = e.target.dataset && e.target.dataset.k; if(!k) return;
      if(!s.f[s.mode]) s.f[s.mode] = {};
      s.f[s.mode][k] = e.target.value;
      st.set(s);
      clearTimeout(timer);
      timer = setTimeout(render, 120);
    }
    L('q-form').addEventListener('input', onField);
    L('q-form').addEventListener('change', onField);

    /* ---------- aksi: unduh / bagikan / salin ---------- */
    function withBlob(cb){ L('q-cv').toBlob(cb, 'image/png'); }
    L('q-out').addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b || !current) return;
      if(b.id === 'q-dl'){
        withBlob(function(blob){
          var url = URL.createObjectURL(blob), a = document.createElement('a');
          a.href = url; a.download = 'qr-' + api.today() + '.png';
          document.body.appendChild(a); a.click();
          setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1000);
          api.toast('QR tersimpan di HP');
        });
      }else if(b.id === 'q-sh'){
        withBlob(function(blob){
          var file = null;
          try{ file = new File([blob], 'qr.png', { type: 'image/png' }); }catch(err){}
          if(file && navigator.canShare && navigator.canShare({ files: [file] })){
            navigator.share({ files: [file], text: current.isLink ? current.value : '' }).catch(function(){});
          }else if(navigator.share){
            navigator.share({ text: current.value }).catch(function(){});
          }else{
            window.open('https://wa.me/?text=' + encodeURIComponent(current.value), '_blank');
          }
        });
      }else if(b.id === 'q-cp'){
        var txt = current.value;
        var ok = function(){ api.toast('Tersalin'); };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(txt).then(ok, function(){ api.toast('Gagal menyalin'); });
        }else{
          var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
          try{ document.execCommand('copy'); ok(); }catch(err){ api.toast('Gagal menyalin'); }
          ta.remove();
        }
      }
    });

    renderTabs(); renderForm(); render();

    return {
      destroy: function(){ clearTimeout(timer); },
      menu: [
        { label: 'Kosongkan form ini', danger: true, run: function(){
            var before = JSON.stringify(s.f[s.mode] || {});
            s.f[s.mode] = {}; st.set(s); renderForm(); render();
            api.toast('Form dikosongkan', function(){ s.f[s.mode] = JSON.parse(before); st.set(s); renderForm(); render(); });
        } }
      ]
    };
  }
});
