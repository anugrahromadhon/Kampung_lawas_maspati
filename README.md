# AI Heritage Guide — Kampung Lawas Maspati

## Isi paket
- `index.html` — aplikasi utama (app-shell: top bar, layar Peta & Pemandu, tab bar bawah + tombol pin mic)
- `manifest.json` — supaya bisa di-"Add to Home Screen" dan kebuka full-screen kayak app asli
- `icon-192.png`, `icon-512.png`, `icon-180.png`, `favicon-48.png` — logo aplikasi (motif atap joglo + pin lokasi)
- `api/chat.js` — serverless function proxy aman ke Groq (key API-nya disimpan di server, tidak pernah dikirim ke browser)
- `package.json` — biar Vercel tahu ini project Node.js

## Tampilan sekarang app-shell, bukan halaman web
- Top bar ramping berisi logo + nama app (bukan hero landing page)
- Konten dibagi 2 "layar": **Peta** dan **Pemandu** — pindah lewat tab bar bawah, bukan scroll panjang
- Tombol mic berbentuk pin nempel di tengah tab bar, selalu bisa ditekan dari layar mana pun
- Ikon "i" di pojok kanan atas buka lembar info singkat (pengganti footer)

### Cara "Add to Home Screen" dari Chrome (Android)
1. Buka website hasil deploy-nya di Chrome HP
2. Ketuk menu titik tiga (⋮) di pojok kanan atas Chrome
3. Pilih **"Tambahkan ke layar Utama"** / **"Install app"**
4. Ikon logo joglo akan muncul di home screen, dan kalau dibuka dari situ tampilannya full-screen tanpa address bar Chrome — persis seperti app native

*(Untuk iPhone/Safari: tombol Share → "Add to Home Screen" — proses serupa, ikonnya otomatis kepakai dari `icon-180.png`.)*

## 1. Siapkan Supabase Storage (untuk video & foto)

1. Buat project di [supabase.com](https://supabase.com)
2. **Storage** → **Create bucket** → nama `media` → aktifkan **Public bucket**
3. Buat folder di dalam bucket, nama harus persis seperti ini:

   ```
   01-rumah-4-budaya/       06-markas-pemuda/        11-ipal/
   02-filosofi-jawa/        07-ongko-loro/           12-permainan/
   03-tanaman-herbal/       08-lele/                 13-raden-sumaniharjo/
   04-taman-baca/           09-umkm/                 14-aula/
   05-balai-rw/             10-pojok-selfie/         15-pesarehan/
   ```

4. Upload `video.mp4` + `1.jpg` (dan `2.jpg` kalau ada) ke tiap folder
5. Ambil **Project URL** di **Project Settings → API**, lalu isi ke `SUPABASE_URL` di `index.html` (cari blok `const CONFIG = {...}` di paling atas `<script>`)

## 2. Deploy ke Vercel + set Groq API key sebagai Environment Variable

Kenapa perlu `api/chat.js`? Karena `index.html` ini file statis biasa — environment variable Vercel **tidak bisa langsung dibaca oleh JavaScript di browser**. Env var cuma bisa dibaca kode yang jalan di server, jadi kita taruh pemanggilan Groq di situ, lalu `index.html` tinggal manggil endpoint sendiri (`/api/chat`), bukan manggil Groq langsung.

**Cara A — lewat GitHub (paling gampang untuk update ke depannya)**

1. Push folder ini (`index.html`, `api/chat.js`, `package.json`) ke repo GitHub baru
2. Buka [vercel.com](https://vercel.com) → **Add New → Project** → pilih repo tsb → **Deploy**
   (Vercel otomatis mengenali `index.html` sebagai halaman utama dan folder `api/` sebagai serverless function, tanpa konfigurasi tambahan)
3. Setelah project ke-import, buka **Project Settings → Environment Variables**
4. Tambah variable baru:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_xxxxxxxxxxxxxxxxxxxx` (API key dari [console.groq.com/keys](https://console.groq.com/keys))
   - **Environment**: centang Production, Preview, dan Development
5. Klik **Save**, lalu buka tab **Deployments** → titik tiga di deployment terakhir → **Redeploy** (env var baru hanya berlaku setelah redeploy)

**Cara B — lewat Vercel CLI (tanpa GitHub)**

```bash
npm i -g vercel
cd folder-project-ini
vercel                      # ikuti prompt untuk deploy pertama kali
vercel env add GROQ_API_KEY # paste API key Groq kalian saat diminta
vercel --prod                # deploy ulang ke production supaya env var terpakai
```

## 3. Cek hasilnya

Setelah deploy, buka domain Vercel kalian (mis. `https://nama-project.vercel.app`), tekan tombol pin mic, dan coba tanya sesuatu ke Cak Pandu. Endpoint proxy-nya otomatis aktif di `https://nama-project.vercel.app/api/chat` — tidak perlu diatur manual, `index.html` sudah menunjuk ke path relatif `/api/chat`.

Kalau muncul jawaban error "GROQ_API_KEY belum diset di Environment Variables Vercel" → berarti langkah 2.4 di atas belum tersimpan/belum di-redeploy.

## Alternatif: hosting statis biasa (tanpa Vercel)

Kalau suatu saat mau pakai hosting statis polos (Netlify tanpa function, GitHub Pages, cPanel) yang tidak mendukung serverless function, `api/chat.js` tidak akan jalan di situ. Opsinya: taruh langsung `GROQ_API_KEY` di `CONFIG` dalam `index.html` dan fetch langsung ke `https://api.groq.com/openai/v1/chat/completions` (seperti versi sebelumnya) — tapi ingat, key jadi terlihat di source code halaman. Cocok untuk prototipe kecil, kurang cocok untuk publik luas.

## Catatan fitur suara (mic)

Web Speech API butuh **HTTPS** (Vercel otomatis HTTPS) dan izin mikrofon dari browser. Dukungan terbaik di Chrome (desktop & Android); Safari/iOS agak terbatas.
