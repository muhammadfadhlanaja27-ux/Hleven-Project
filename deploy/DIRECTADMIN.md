# Deploy H'Leven ke DirectAdmin

Domain: FE `https://hleven.my.id`, API `https://api.hleven.my.id`.

## 1. Struktur file di DirectAdmin

```
domains/
├── hleven.my.id/public_html/      <- isi frontend/dist/ (index.html, assets/, .htaccess, favicon.jpg, icons.svg)
└── api.hleven.my.id/
    ├── backend/                   <- seluruh backend/ KECUALI folder public/ (+ vendor/ wajib)
    └── public_html/               <- isi backend/public/ + deploy/directadmin-index.php sebagai index.php
```

## 2. Upload frontend

Upload seluruh isi `frontend/dist/` (termasuk `.htaccess` hidden) ke `domains/hleven.my.id/public_html/`.
`dist/` sudah di-build dengan `VITE_API_URL=https://api.hleven.my.id/api/v1` (dari `frontend/.env.production`).
Rebuild bila perlu: `cd frontend && npm run build`.

## 3. Upload backend

1. Upload `backend/*` kecuali `backend/public/` ke `domains/api.hleven.my.id/backend/` (termasuk `vendor/`).
2. Upload `backend/public/*` (termasuk `.htaccess` hidden) ke `domains/api.hleven.my.id/public_html/`,
   lalu timpa `index.php` dengan `deploy/directadmin-index.php` (rename jadi `index.php`).
3. Copy `deploy/ENV-DIRECTADMIN.txt` menjadi `domains/api.hleven.my.id/backend/.env`, isi `APP_KEY` (copy dari lokal) dan `DB_PASSWORD` + kredensial lain.
4. PHP DirectAdmin **≥ 8.3** untuk domain + cron.

## 4. Migrate + storage (pengganti SSH)

Key = nilai `APP_KEY` di `.env` (urlencode `+` `/` `=`).

1. `GET https://api.hleven.my.id/internal/migrate?key=<APP_KEY>` → `{"ok":true}`.
2. `GET https://api.hleven.my.id/internal/link?key=<APP_KEY>` → symlink `public/storage`.
   Kalau symlink diblokir: hapus `public_html/storage`, buat folder biasa,
   lalu copy isi `backend/storage/app/public/` ke dalamnya tiap ada upload baru.
3. **Hapus kedua route `/internal/*` di `backend/routes/web.php`, upload ulang, selesai.**

## 5. Langkah terakhir (dari checklist)

1. Hapus isi `backend/bootstrap/cache/` kecuali `.gitignore`.
2. Permission `755`/`775` untuk `backend/storage/` dan `backend/bootstrap/cache/`.
3. Buka `https://api.hleven.my.id/up` → 200. `APP_DEBUG=true` sementara agar error 500 tampil detail; set `false` bila sudah aman.
4. Cron DirectAdmin (tiap menit, PHP 8.3):
```
php /home/<user>/domains/api.hleven.my.id/backend/artisan schedule:run >> /dev/null 2>&1
php /home/<user>/domains/api.hleven.my.id/backend/artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

## 6. Verifikasi

- `https://api.hleven.my.id/api/v1/hotels` → JSON public.
- Buka FE → login → DevTools: request ke `api.hleven.my.id`, tanpa error CORS.
- Callback Midtrans: `https://api.hleven.my.id/api/v1/payments/callback`.

## 7. Catatan

`config/cors.php` sudah memuat `hleven.my.id` + `www`. `SANCTUM_STATEFUL_DOMAINS` ada di `ENV-DIRECTADMIN.txt`.
