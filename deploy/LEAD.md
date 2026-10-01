# Deploy H'Leven ke cPanel (tanpa SSH, Midtrans sandbox)

Domain: FE `https://hleven.my.id` (+www), API `https://api.hleven.my.id`.

## 1. Struktur file di cPanel

```
~/
├── hleven-backend/              <- seluruh backend/ KECUALI folder public/
│   ├── app/  bootstrap/  config/  database/  resources/
│   ├── routes/  storage/  vendor/   <- WAJIB upload (tanpa SSH tak bisa composer install)
│   └── .env                     <- dari deploy/ENV-CPANEL.txt (rename, isi nilai)
│
├── public_html/                 <- docroot hleven.my.id (FE)
│   ├── .htaccess                <- dari frontend/dist/.htaccess (fallback index.html)
│   ├── index.html
│   └── assets/  favicon.jpg  icons.svg
│
└── public_html/api/             <- docroot subdomain api.hleven.my.id
    ├── index.php                <- dari deploy/api-index.php (rename!)
    ├── .htaccess                <- dari backend/public/.htaccess (hidden file, jangan lupa upload)
    ├── favicon.ico  robots.txt
    └── storage/                 <- hasil /internal/link (symlink); kalau gagal, buat manual (lihat §4)
```

`deploy/api-index.php` mengasumsikan backend di `~/hleven-backend/`. Kalau nama folder beda,
ubah 3 path `__DIR__.'/../../hleven-backend/...'` di file itu.

## 2. Upload backend

1. Subdomain `api.hleven.my.id` → docroot `public_html/api`.
2. Upload `backend/public/*` (termasuk `.htaccess` hidden) ke `public_html/api/`,
   lalu timpa `index.php` dengan `deploy/api-index.php` (rename jadi `index.php`).
3. Upload sisa `backend/` ke `~/hleven-backend/` (termasuk `vendor/`).
4. Buat DB + user MySQL di cPanel. Isi `.env` dari `deploy/ENV-CPANEL.txt`.
5. PHP selector cPanel **≥ 8.3** (Laravel 13, `composer.json:9`) untuk domain + cron.

## 3. Upload frontend

`frontend/dist/` sudah di-build dengan `VITE_API_URL=https://api.hleven.my.id/api/v1`.
Upload seluruh isi `dist/` (termasuk `.htaccess` hidden) ke docroot `hleven.my.id`.
Kalau rebuild: `VITE_API_URL=https://api.hleven.my.id/api/v1 VITE_MIDTRANS_CLIENT_KEY=<sandbox-key> npm run build`.

## 4. Migrate + storage (pengganti SSH)

Key = nilai `APP_KEY` di `.env`, urlencode (`:` → `%3A` tidak perlu; encode `+` `/` `=`).

1. `GET https://api.hleven.my.id/internal/migrate?key=<APP_KEY>` → `{"ok":true}`.
2. `GET https://api.hleven.my.id/internal/link?key=<APP_KEY>` → symlink `public/storage`.
   Kalau symlink diblokir hosting: hapus folder `public_html/api/storage`, buat folder biasa,
   lalu copy isi `~/hleven-backend/storage/app/public/` ke dalamnya tiap ada upload baru.
3. **Hapus kedua route `/internal/*` di `routes/web.php`, upload ulang, selesai.**

## 5. Cron cPanel (2 job, tiap menit, PHP 8.3)

```
php ~/hleven-backend/artisan schedule:run >> /dev/null 2>&1      # booking:check-expired
php ~/hleven-backend/artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

## 6. Verifikasi

- `https://api.hleven.my.id/up` → 200 (health Laravel).
- `https://api.hleven.my.id/api/v1/hotels` → JSON public.
- Buka FE → login → buka DevTools: request ke `api.hleven.my.id`, tanpa error CORS.
- Test booking sandbox Midtrans; callback URL di dashboard Midtrans:
  `https://api.hleven.my.id/api/v1/payments/callback`.

## 7. Catatan CORS/Sanctum

`config/cors.php` sudah memuat `hleven.my.id` + `www`. `withCredentials:true`
(`frontend/src/services/api.js:8`) butuh origin FE persis — kalau FE diakses via `www`,
pastikan yang dibuka konsisten, atau tambah origin lain di `allowed_origins`.
`SANCTUM_STATEFUL_DOMAINS` sudah di `ENV-CPANEL.txt` (dipakai bila Sanctum session dipakai).
