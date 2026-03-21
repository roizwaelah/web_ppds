## Setup di perangkat lain

1. Clone repo:
   ```bash
   git clone <url-repo>
   cd "PP Github"
   ```
2. Install dependency:
   ```bash
   npm install
   ```
3. Buat file `.env` dari contoh:
   - copy `.env.example` menjadi `.env`
   - isi semua value sesuai server/local masing-masing
4. Jalankan project:
   ```bash
   # terminal 1 (backend PHP)
   php -S localhost:8000

   # terminal 2 (frontend Vite)
   npm run dev
   ```

## Catatan penting

- Jangan commit file `.env` karena berisi rahasia.
- Jika butuh build production:
  ```bash
  npm run build
  ```

- Frontend memanggil endpoint backend di `/api/*` dan saat development diproxy ke `http://localhost:8000` (lihat `vite.config.js`).
- Untuk local non-HTTPS, gunakan `SECURE_COOKIE=false` agar cookie auth tetap terkirim.
