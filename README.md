# AI Style Studio — Gemini Edition

Website transformasi foto AI berbasis Next.js App Router, dirancang untuk deployment di Vercel dan memakai Gemini API (bukan Replicate).

## Fitur

- 16 preset style: Ghibli-inspired, hijab portrait, action figure, 3D cartoon, anime, chibi, realistic, cinematic, cyberpunk, clay, watercolor, pixel art, fashion editorial, fantasy, retro film, dan miniature.
- Upload JPG/PNG/WebP maksimum 10 MB.
- Prompt tambahan, pilihan rasio, galeri style, status proses, hasil, dan tombol unduh.
- Backend server-side di `/api/generate`; API key tidak dikirim ke browser.
- Tidak memakai database.

## Deploy ke Vercel

1. Ekstrak ZIP ini dan unggah folder proyek ke repository GitHub.
2. Impor repository di https://vercel.com/new. Framework Next.js biasanya terdeteksi otomatis.
3. Buat API key di https://aistudio.google.com/apikey.
4. Di Vercel buka **Project → Settings → Environment Variables**. Tambahkan `GEMINI_API_KEY` dengan value API key dari Google AI Studio.
5. Tambahkan `GEMINI_IMAGE_MODEL` dengan value `gemini-nano-banana-2.1` jika ingin memakai default model di proyek ini. Jika model tersebut tidak tersedia untuk akun/endpoint Anda, ubah ke ID model image generation yang didukung akun dan API Anda.
6. Simpan variabel lalu lakukan **Redeploy**.
7. Buka domain Vercel, upload foto, pilih style, lalu tekan Generate.

Jangan menaruh API key di `NEXT_PUBLIC_*`, `app/page.jsx`, atau repository publik. Jangan bagikan key.

## Menjalankan lokal

Butuh Node.js 18.17 atau lebih baru.

```bash
npm install
cp .env.example .env.local
# Edit .env.local, masukkan GEMINI_API_KEY asli
npm run dev
```

Buka http://localhost:3000.

## Backend Gemini

Route `app/api/generate/route.js` mengirim foto dan prompt ke Google Gemini Interactions API di `https://generativelanguage.googleapis.com/v1beta/interactions`, lalu mengembalikan hasil gambar sebagai data URL untuk ditampilkan dan diunduh browser. Model default diatur melalui `GEMINI_IMAGE_MODEL`. API model dan ketersediaannya dapat berbeda menurut akun, wilayah, dan perubahan Google; cek dokumentasi resmi: https://ai.google.dev/gemini-api/docs/image-generation

## Biaya dan batasan

- Harga/kuota bergantung pada model Gemini yang dipilih, jenis akun, wilayah, dan ketentuan Google yang berlaku. Periksa Google AI Studio sebelum membuka situs untuk publik. Jangan mengasumsikan semua akun memiliki kuota gratis.
- Vercel memiliki batas durasi fungsi sesuai paket. Route ini menunggu respons secara sinkron dengan timeout sekitar 55 detik; untuk model yang lambat, pertimbangkan arsitektur job asinkron.
- Foto dikirim ke Google untuk diproses. Tinjau kebijakan Google dan jangan unggah foto sensitif atau foto orang lain tanpa izin.
- Terapkan rate limiting, autentikasi, batas pemakaian, dan monitoring sebelum membuka layanan untuk publik agar API key dan biaya tidak disalahgunakan.
- Style Ghibli adalah preset deskriptif bergaya animasi fantasi; hasil bukan salinan resmi atau jaminan gaya tertentu.

## Pemeriksaan

```bash
npm run build
```

Deployment belum bisa diuji penuh tanpa API key yang valid dan akses model pada akun Anda.
# ai-studio
