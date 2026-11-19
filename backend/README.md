# H'Leven Backend API

Service API utama untuk platform reservasi hotel H'Leven, dibangun dengan framework Laravel 13.

## 1. Ringkasan Backend

Service ini berfungsi sebagai penyedia data dan logika bisnis (API-only) untuk aplikasi frontend React.

- **Stack Teknologi**:
  - **Framework**: Laravel 13 (PHP 8.3)
  - **Autentikasi**: Laravel Sanctum
  - **Database**: MySQL (Development), SQLite (Testing)
  - **Payment Gateway**: Midtrans
  - **File Storage**: Local Storage (Public Disk)
  - **Tools**: Laravel Pint (Formatting), PHPUnit (Testing)

- **Cara Menjalankan Lokal**:
  1. Masuk ke direktori: `cd backend`
  2. Install dependensi: `composer install`
  3. Konfigurasi environment: `cp .env.example .env` (sesuaikan kredensial DB & Midtrans)
  4. Generate key & Migrasi: `php artisan key:generate && php artisan migrate`
  5. Jalankan server: `composer dev` (menjalankan server API, queue, dan Vite secara bersamaan)

---

## 2. Struktur Folder & Kegunaannya

| Direktori | Peran & Deskripsi |
|-----------|-------------------|
| `app/Http/Controllers/Api/V1` | Handler utama untuk request API, dipisahkan berdasarkan versi (V1). |
| `app/Services` | Lapisan logika bisnis (Business Logic Layer) untuk menjaga controller tetap ramping. |
| `app/Models` | Representasi tabel database dan relasi antar model Eloquent. |
| `app/Http/Requests` | Validasi input data menggunakan Form Request (misal: `RegisterRequest`, `CreateBookingRequest`). |
| `app/Http/Resources` | Transformasi data model ke format JSON response yang konsisten. |
| `app/Http/Middleware` | Filter keamanan dan akses (misal: `CheckRole` untuk otorisasi, `CheckHotelSuspended`). |
| `app/Console/Commands` | Tugas terjadwal (Scheduled Tasks), seperti pengecekan booking kadaluarsa. |
| `routes/api.php` | Definisi seluruh endpoint API dengan pengelompokan middleware. |

---

## 3. Alur Logika Utama (Flow)

### A. Alur Autentikasi (Sanctum)
1. **Request**: Client mengirim kredensial ke `/api/v1/login`.
2. **Validation**: `LoginRequest` memastikan input email dan password valid secara format.
3. **Logic**: `AuthenticationService` memverifikasi user di database.
4. **Token**: Jika valid, sistem men-generate `access_token` melalui Laravel Sanctum.
5. **Response**: Mengembalikan data user dan token untuk disimpan di `localStorage` frontend.

### B. Alur Reservasi (Booking)
```text
Client (Frontend) 
   │
   ▼
[POST /v1/bookings] ──▶ BookingController ──▶ CreateBookingRequest (Validation)
                               │
                               ▼
                        BookingService (Business Logic)
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
  Check Availability                          Calculate Price
(RoomAvailabilityService)                    (PricingService)
         │                                           │
         ▼                                           ▼
  Store Database ◀─── [Transaction] ───▶ Generate Payment Token
 (Booking, Payment)                         (MidtransService)
                               │
                               ▼
                        JSON Response (Booking Data + Snap Token)
```

### C. Error Handling
Sistem menggunakan format response seragam untuk error:
```json
{
    "success": false,
    "message": "Pesan error di sini",
    "errors": { "field_name": ["Detail error"] }
}
```

---

## 4. Konvensi & Catatan Penting

- **Environment Variable (`.env`)**:
  - Pastikan `MIDTRANS_SERVER_KEY` terkonfigurasi untuk fitur pembayaran dan unggah foto.
- **Role-Based Access Control (RBAC)**:
  - Menggunakan kolom `users.role` dengan nilai: `user`, `admin_hotel`, `super_admin`.
  - Middleware `role:NAME` digunakan di routes untuk membatasi akses.
- **Aturan Pengembangan**:
  - **Database**: Dilarang mengubah skema tanpa migrasi. Ikuti aturan di `md/Database.md`.
  - **Code Style**: Jalankan `php artisan pint` sebelum melakukan commit untuk menjaga kerapihan kode.
  - **Testing**: Gunakan `composer test` untuk menjalankan unit & feature test (menggunakan SQLite in-memory).
