# H'Leven — Sistem Manajemen & Booking Hotel

Aplikasi web untuk pemesanan kamar hotel dan pengelolaan operasional hotel. Proyek ini dibangun agar pemilik hotel (mitra) dapat mengelola kamar, tipe ranjang, fasilitas, pesanan, dan laporan pendapatan sendiri, sementara tim internal (super admin) memverifikasi mitra dan memantau seluruh platform. Dibuat sebagai solusi terintegrasi yang menggabungkan sisi pelanggan, sisi mitra hotel, dan sisi administrator dalam satu basis kode.

## Fitur Utama

- **Publik / Pelanggan** — cari hotel, lihat detail kamar, buat pesanan (termasuk checkout tanpa akun), riwayat booking, dan pembayaran via Midtrans.
- **Mitra Hotel (admin_hotel)** — dashboard, kelola kamar, tipe kamar, tipe ranjang (bed type), fasilitas, pesanan, ulasan, laporan pendapatan, dan profil hotel.
- **Super Admin** — monitoring hotel, persetujuan mitra, manajemen pengguna, peringatan (warning), appeal, activity log, dan laporan platform.
- **Autentikasi** — Laravel Sanctum (token-based), dengan tiga peran: `user`, `admin_hotel`, `super_admin`.

## Prasyarat (Prerequisites)

| Perangkat | Versi minimal |
|---|---|
| PHP | 8.3 |
| Composer | 2.x |
| Node.js | 20.x (disarankan) |
| npm | 10.x |
| MySQL | 8.x *(atau PostgreSQL — lihat `backend/.env`)* |

> Catatan: pengujian (`php artisan test`) memakai SQLite in-memory, jadi tidak perlu menyiapkan database untuk menjalankan test.

## Struktur Proyek

```text
Hleven-Project/
├── README.md                 # Dokumen ini
├── AGENTS.md                 # Panduan untuk AI agent / kontributor otomatis
├── opencode.json             # Konfigurasi opencode
├── backend/                  # Laravel 13 (API-only)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/V1/            # Controller API versi 1 (AuthController, BookingController, ...)
│   │   │   │   ├── SuperAdmin*.php    # Controller super admin
│   │   │   │   └── ...                # ProfileController, PaymentController, dll.
│   │   │   └── Middleware/            # CheckRole, CheckHotelSuspended, dll.
│   │   ├── Models/           # Model Eloquent (Hotel, RoomType, BedType, Booking, ...)
│   │   └── Services/         # Logika bisnis (BookingService, MidtransService, ...)
│   ├── database/
│   │   ├── migrations/       # Skema database
│   │   └── seeders/          # Data awal/demo
│   ├── routes/
│   │   ├── api.php           # Semua endpoint /api/v1
│   │   └── console.php       # Scheduled command (booking:check-expired)
│   ├── tests/                # PHPUnit (SQLite in-memory)
│   ├── composer.json         # Dependensi & script backend
│   └── .env.example          # Contoh konfigurasi lingkungan backend
└── frontend/                 # React 19 + Vite 8 + Tailwind v4
    ├── src/
    │   ├── App.jsx           # Definisi route React Router
    │   ├── main.jsx          # Entry point
    │   ├── components/       # Komponen UI (admin-hotel/, super-admin/, layouts/, ui/, ...)
    │   ├── pages/
    │   │   ├── auth/         # Login & Register
    │   │   ├── user/         # Halaman pelanggan (HotelList, BookingPage, ...)
    │   │   ├── admin-hotel/  # Dashboard & manajemen mitra
    │   │   ├── super-admin/  # Halaman super admin
    │   │   └── mitra/        # Registrasi mitra
    │   ├── services/
    │   │   ├── api.js        # Instance Axios (baseURL dari VITE_API_URL)
    │   │   └── apiCache.js   # Helper cache & invalidasi
    │   └── index.css         # Tailwind
    ├── package.json          # Dependensi & script frontend
    ├── vite.config.js        # Konfigurasi Vite (port 5713)
    └── .env                  # Konfigurasi lingkungan frontend
```

## Cara Instalasi (Installation)

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Sesuaikan koneksi database di `backend/.env` (contoh MySQL):

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_hotel
DB_USERNAME=root
DB_PASSWORD=
```

Buat database `db_hotel`, lalu jalankan migrasi dan (opsional) seeder:

```bash
php artisan migrate --force
php artisan db:seed          # opsional: data demo
```

Aset Laravel (opsional, hanya jika memakai `resources/` bawaan):

```bash
npm install
npm run build
```

> Alternatif cepat: `composer setup` menjalankan seluruh langkah di atas (install, `.env`, key, migrate, build aset) secara berurutan.

### 2. Frontend

```bash
cd frontend
npm install
```

Pastikan `frontend/.env` menunjuk ke API backend:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
VITE_MIDTRANS_CLIENT_KEY=<client-key-anda>
```

## Cara Penggunaan (Usage)

### Menjalankan aplikasi

Buka dua terminal:

```bash
# Terminal 1 — backend (http://localhost:8000)
cd backend
php artisan serve
```

```bash
# Terminal 2 — frontend (http://localhost:5713)
cd frontend
npm run dev
```

Buka `http://localhost:5713` di browser. Semua endpoint API berada di `http://localhost:8000/api/v1`.

### Menjalankan scheduler (opsional)

Command `booking:check-expired` berjalan tiap menit untuk membatalkan booking yang kedaluwarsa:

```bash
cd backend
php artisan schedule:work
```

### Akun demo (jika menjalankan `php artisan db:seed`)

| Peran | Email | Password |
|---|---|---|
| Super Admin | `superadmin@hleven.com` | `password123` |
| Admin Hotel | `adminhotel@hleven.com` | `password123` |
| User | `user@hleven.com` | `password123` |

### Contoh pemanggilan API

```bash
# Login dan ambil token
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@hleven.com","password":"password123"}'

# Daftar hotel (endpoint publik)
curl http://localhost:8000/api/v1/hotels
```

```bash
# Contoh endpoint terproteksi (butuh token Sanctum)
curl http://localhost:8000/api/v1/hotel/bookings \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Build untuk produksi

```bash
cd frontend && npm run build      # hasil ada di frontend/dist/
```

### Menjalankan pengujian

```bash
cd backend
composer test                     # php artisan config:clear && php artisan test
./vendor/bin/pint                 # formatter
cd ../frontend && npm run lint    # eslint
```

### Tangkapan Layar

> Tambahkan gambar ke folder `docs/screenshots/` lalu tautkan di sini, contoh:

```markdown
![Landing Page](docs/screenshots/landing.png)
![Dashboard Mitra Hotel](docs/screenshots/dashboard-admin-hotel.png)
![Dashboard Super Admin](docs/screenshots/dashboard-super-admin.png)
```

## Catatan Tambahan

- **Perubahan skema database harus disetujui lebih dulu** — lihat aturan *Hard rules* di `AGENTS.md`.
- **Penyimpanan file** (foto hotel, kamar, avatar) memakai Supabase Storage; database utama berjalan di MySQL/PostgreSQL sesuai `backend/.env`.
- **CORS** backend mengizinkan `localhost:5713` (port frontend) beserta 5173/5174/3000.
