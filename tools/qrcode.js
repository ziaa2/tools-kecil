/* =====================================================================
   QR Code encoder mandiri (mode byte/UTF-8, versi 1–40, koreksi L/M/Q/H)
   Tanpa library luar. Dipakai: QRCode.encode('teks', 'M') → {size, get(x,y)}
   Algoritma mengikuti spesifikasi ISO/IEC 18004.
   ===================================================================== */
(function(root){
  'use strict';

  var ECC_PER_BLOCK = [
    [-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
    [-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    [-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]
  ];
  var NUM_BLOCKS = [
    [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
    [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
    [-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],
    [-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]
  ];
  var ECL_INDEX = { L: 0, M: 1, Q: 2, H: 3 };
  var ECL_FORMAT = [1, 0, 3, 2];

  function rawModules(ver){
    var r = (16 * ver + 128) * ver + 64;
    if(ver >= 2){
      var na = Math.floor(ver / 7) + 2;
      r -= (25 * na - 10) * na - 55;
      if(ver >= 7) r -= 36;
    }
    return r;
  }
  function dataCodewords(ver, e){
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[e][ver] * NUM_BLOCKS[e][ver];
  }
  function getBit(x, i){ return ((x >>> i) & 1) !== 0; }

  /* ---------- Reed-Solomon ---------- */
  function rsMul(x, y){
    var z = 0;
    for(var i = 7; i >= 0; i--){
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function rsDivisor(degree){
    var res = [], i, j;
    for(i = 0; i < degree - 1; i++) res.push(0);
    res.push(1);
    var r = 1;
    for(i = 0; i < degree; i++){
      for(j = 0; j < res.length; j++){
        res[j] = rsMul(res[j], r);
        if(j + 1 < res.length) res[j] ^= res[j + 1];
      }
      r = rsMul(r, 0x02);
    }
    return res;
  }
  function rsRemainder(data, div){
    var res = div.map(function(){ return 0; });
    data.forEach(function(b){
      var f = b ^ res.shift();
      res.push(0);
      div.forEach(function(c, i){ res[i] ^= rsMul(c, f); });
    });
    return res;
  }

  function toUtf8(str){
    if(typeof TextEncoder !== 'undefined') return Array.prototype.slice.call(new TextEncoder().encode(str));
    var s = unescape(encodeURIComponent(str)), out = [];
    for(var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  /* ---------- penyusunan data ---------- */
  function buildCodewords(bytes, ver, e){
    var bits = [];
    function put(val, len){ for(var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);                                   // mode byte
    put(bytes.length, ver <= 9 ? 8 : 16);        // jumlah karakter
    bytes.forEach(function(b){ put(b, 8); });
    var cap = dataCodewords(ver, e) * 8;
    put(0, Math.min(4, cap - bits.length));      // terminator
    put(0, (8 - bits.length % 8) % 8);
    var data = [];
    for(var i = 0; i < bits.length; i += 8){
      var v = 0;
      for(var j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }
    for(var pad = 0xEC; data.length < cap / 8; pad ^= 0xEC ^ 0x11) data.push(pad);
    return data;
  }
  function interleave(data, ver, e){
    var nb = NUM_BLOCKS[e][ver], eccLen = ECC_PER_BLOCK[e][ver];
    var raw = Math.floor(rawModules(ver) / 8);
    var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var blocks = [], div = rsDivisor(eccLen), i, k = 0;
    for(i = 0; i < nb; i++){
      var dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
      k += dat.length;
      var ecc = rsRemainder(dat, div);
      if(i < nShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var out = [];
    for(i = 0; i < blocks[0].length; i++){
      blocks.forEach(function(blk, j){
        if(i !== shortLen - eccLen || j >= nShort) out.push(blk[i]);
      });
    }
    return out;
  }

  /* ---------- gambar matriks ---------- */
  function Matrix(ver, e){
    this.ver = ver; this.e = e;
    this.size = ver * 4 + 17;
    var n = this.size, y;
    this.m = []; this.f = [];
    for(y = 0; y < n; y++){
      var a = [], b = [];
      for(var x = 0; x < n; x++){ a.push(false); b.push(false); }
      this.m.push(a); this.f.push(b);
    }
  }
  Matrix.prototype.setF = function(x, y, dark){ this.m[y][x] = dark; this.f[y][x] = true; };
  Matrix.prototype.drawFunctions = function(){
    var n = this.size, i, j, self = this;
    for(i = 0; i < n; i++){ this.setF(6, i, i % 2 === 0); this.setF(i, 6, i % 2 === 0); }
    function finder(x, y){
      for(var dy = -4; dy <= 4; dy++) for(var dx = -4; dx <= 4; dx++){
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
        if(xx >= 0 && xx < n && yy >= 0 && yy < n) self.setF(xx, yy, d !== 2 && d !== 4);
      }
    }
    function align(x, y){
      for(var dy = -2; dy <= 2; dy++) for(var dx = -2; dx <= 2; dx++)
        self.setF(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    var pos = this.alignPositions(), na = pos.length;
    for(i = 0; i < na; i++) for(j = 0; j < na; j++){
      if(!((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0))) align(pos[i], pos[j]);
    }
    this.drawFormat(0);
    this.drawVersion();
  };
  Matrix.prototype.alignPositions = function(){
    var ver = this.ver;
    if(ver === 1) return [];
    var na = Math.floor(ver / 7) + 2;
    var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
    var res = [6];
    for(var p = this.size - 7; res.length < na; p -= step) res.splice(1, 0, p);
    return res;
  };
  Matrix.prototype.drawFormat = function(mask){
    var data = (ECL_FORMAT[this.e] << 3) | mask, rem = data, i, n = this.size;
    for(i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = ((data << 10) | rem) ^ 0x5412;
    for(i = 0; i <= 5; i++) this.setF(8, i, getBit(bits, i));
    this.setF(8, 7, getBit(bits, 6)); this.setF(8, 8, getBit(bits, 7)); this.setF(7, 8, getBit(bits, 8));
    for(i = 9; i < 15; i++) this.setF(14 - i, 8, getBit(bits, i));
    for(i = 0; i < 8; i++) this.setF(n - 1 - i, 8, getBit(bits, i));
    for(i = 8; i < 15; i++) this.setF(8, n - 15 + i, getBit(bits, i));
    this.setF(8, n - 8, true);
  };
  Matrix.prototype.drawVersion = function(){
    if(this.ver < 7) return;
    var rem = this.ver, i, n = this.size;
    for(i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    var bits = (this.ver << 12) | rem;
    for(i = 0; i < 18; i++){
      var c = getBit(bits, i), a = n - 11 + i % 3, b = Math.floor(i / 3);
      this.setF(a, b, c); this.setF(b, a, c);
    }
  };
  Matrix.prototype.drawCodewords = function(data){
    var n = this.size, i = 0;
    for(var right = n - 1; right >= 1; right -= 2){
      if(right === 6) right = 5;
      for(var vert = 0; vert < n; vert++){
        for(var j = 0; j < 2; j++){
          var x = right - j, up = ((right + 1) & 2) === 0, y = up ? n - 1 - vert : vert;
          if(!this.f[y][x] && i < data.length * 8){
            this.m[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  };
  Matrix.prototype.applyMask = function(mask){
    var n = this.size;
    for(var y = 0; y < n; y++) for(var x = 0; x < n; x++){
      var inv;
      switch(mask){
        case 0: inv = (x + y) % 2 === 0; break;
        case 1: inv = y % 2 === 0; break;
        case 2: inv = x % 3 === 0; break;
        case 3: inv = (x + y) % 3 === 0; break;
        case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: inv = x * y % 2 + x * y % 3 === 0; break;
        case 6: inv = (x * y % 2 + x * y % 3) % 2 === 0; break;
        default: inv = ((x + y) % 2 + x * y % 3) % 2 === 0;
      }
      if(!this.f[y][x] && inv) this.m[y][x] = !this.m[y][x];
    }
  };
  Matrix.prototype.penalty = function(){
    var n = this.size, m = this.m, p = 0, x, y, k, run, dark = 0;
    var A = [1,0,1,1,1,0,1,0,0,0,0], B = [0,0,0,0,1,0,1,1,1,0,1];
    function match(get, i, pat){
      for(var t = 0; t < 11; t++) if((get(i + t) ? 1 : 0) !== pat[t]) return false;
      return true;
    }
    for(var dir = 0; dir < 2; dir++){
      for(y = 0; y < n; y++){
        var get = dir === 0 ? function(i){ return m[y][i]; } : function(i){ return m[i][y]; };
        run = 1;
        for(x = 1; x < n; x++){
          if(get(x) === get(x - 1)){
            run++;
            if(run === 5) p += 3; else if(run > 5) p += 1;
          }else run = 1;
        }
        for(x = 0; x + 11 <= n; x++){
          if(match(get, x, A)) p += 40;
          if(match(get, x, B)) p += 40;
        }
      }
    }
    for(y = 0; y < n; y++) for(x = 0; x < n; x++){
      if(m[y][x]) dark++;
      if(x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
    }
    var total = n * n;
    k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    return p + k * 10;
  };

  /* ---------- API ---------- */
  function encodeWith(bytes, e){
    var ver, used;
    for(ver = 1; ver <= 40; ver++){
      used = 4 + (ver <= 9 ? 8 : 16) + 8 * bytes.length;
      if(used <= dataCodewords(ver, e) * 8) break;
    }
    if(ver > 40) return null;
    var codewords = interleave(buildCodewords(bytes, ver, e), ver, e);
    var mx = new Matrix(ver, e);
    mx.drawFunctions();
    mx.drawCodewords(codewords);
    var best = 0, bestP = Infinity;
    for(var mask = 0; mask < 8; mask++){
      mx.applyMask(mask); mx.drawFormat(mask);
      var p = mx.penalty();
      if(p < bestP){ bestP = p; best = mask; }
      mx.applyMask(mask);
    }
    mx.applyMask(best); mx.drawFormat(best);
    return mx;
  }

  function encode(text, ecl){
    var bytes = toUtf8(String(text));
    var order = [ECL_INDEX[ecl] !== undefined ? ECL_INDEX[ecl] : 1, 0];   // kalau terlalu panjang, turun ke L
    var mx = null;
    for(var i = 0; i < order.length && !mx; i++) mx = encodeWith(bytes, order[i]);
    if(!mx) throw new Error('Teks terlalu panjang untuk QR');
    return { size: mx.size, version: mx.ver, get: function(x, y){ return mx.m[y][x]; } };
  }

  root.QRCode = { encode: encode, _capacity: dataCodewords };
})(typeof window !== 'undefined' ? window : globalThis);
