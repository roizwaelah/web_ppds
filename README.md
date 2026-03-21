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
   npm run dev
   ```

## Catatan penting

- Jangan commit file `.env` karena berisi rahasia.
- Jika butuh build production:
  ```bash
  npm run build
  ```
