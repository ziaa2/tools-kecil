# Tools Kecil

Kumpulan tools sederhana buat sehari-hari, khusus HP. Minimalis, dark mode, tanpa daftar akun, tanpa server, tanpa PWA.

Tool saat ini:
- 🛒 **Catet Belanjaan** — catat barang, centang, total estimasi, reset kapan saja.

## Struktur

```
tools-kecil/
├── index.html        halaman utama + daftar <script> tool
├── config.js         pengaturan (link Saweria)
├── .nojekyll         supaya GitHub Pages tidak memproses file
├── assets/
│   ├── style.css     tampilan umum (dark, minimalis)
│   └── app.js        mesin: daftar tool, router, menu, backup
└── tools/
    └── belanja.js    satu tool = satu file
```

## Pasang di GitHub Pages

1. Buat repo baru di GitHub (mis. `tools-kecil`), upload semua isi folder ini.
2. Buka **Settings → Pages**.
3. Di **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit. Alamatnya: `https://USERNAME.github.io/tools-kecil/`

## Tombol donasi Saweria

Buka `config.js`, ganti `USERNAMEKAMU` dengan username Saweria kamu. Tombol **☕ Donasi** muncul di kanan atas halaman utama. Kosongkan nilainya (`''`) kalau ingin tombolnya disembunyikan.

## Backup (supaya pengguna merasa aman)

Data tiap orang tersimpan di browser HP masing-masing (localStorage), jadi tidak ada yang dikirim ke server. Karena data browser bisa terhapus, setiap tool bisa menyediakan menu **⋯ → Backup & bagikan**:

- **Download file backup** — simpan sebagai file `.json` di HP.
- **Kirim ke WhatsApp** — kirim isi catatan sebagai teks yang mudah dibaca.
- **Bagikan ke aplikasi lain** — lewat menu share bawaan HP (kalau didukung browser).
- **Pulihkan dari file backup** — impor lagi file `.json` tadi.

## Nambah tool baru

1. Salin `tools/belanja.js` jadi `tools/namatool.js`, lalu ganti `id`, `icon`, `title`, `desc` dan isi `mount()`.
2. Tambahkan satu baris di `index.html`, di bawah `tools/belanja.js`:

   ```html
   <script src="tools/namatool.js"></script>
   ```

Selesai. Kartu di halaman utama, deskripsi, alamat (`#/namatool`), dan tombol back otomatis jalan.

Kerangka minimal sebuah tool:

```js
App.registerTool({
  id: 'catatan',
  icon: '📝',
  title: 'Catatan Cepat',
  desc: 'Deskripsi singkat yang tampil di bawah judul tool.',
  badge: function(){ return ''; },          // opsional: teks kecil di kartu
  css: '.contoh{color:var(--accent)}',      // opsional: CSS khusus tool
  mount: function(root, api){
    var st = api.store('catatan');          // st.get(default) / st.set(data)
    root.innerHTML = '<p class="contoh">Isi tool di sini</p>';
    return {
      menu: [],                             // opsional: aksi tambahan di menu ⋯
      backup: {                             // opsional: aktifkan menu backup
        get: function(){ return st.get([]); },
        set: function(data){ st.set(data); /* lalu render ulang */ },
        text: function(){ return 'teks untuk dibagikan ke WhatsApp'; }
      }
    };
  }
});
```

Helper yang tersedia di `api`: `store`, `toast`, `esc`, `rp`, `buzz`, `uid`, `today`.
