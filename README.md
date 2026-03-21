# PPDS Project

Project ini siap di-upload ke GitHub dan bisa didevelop dari perangkat mana saja.

## List yang di-upload ke GitHub

Upload file/folder berikut:

- `src/`
- `index.html`
- `vite.config.js`
- `package.json`
- `package-lock.json`
- `favicon.png`
- `logo.png`
- `header_ppds.png`
- `CSRF.txt` (jika memang dipakai sebagai dokumentasi, bukan secret)
- `.gitignore`
- `.env.example`
- `LICENSE`
- `README.md`

## List yang jangan di-upload

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- file secret lain (API key, password, token)

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
