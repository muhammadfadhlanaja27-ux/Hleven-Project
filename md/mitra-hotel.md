Anda sedang mengembangkan project H'Leven menggunakan React + Vite.

Saya ingin Anda mengimplementasikan fitur "Mitra Hotel".

PENTING:
Jangan membuat sistem login baru untuk Mitra.

Gunakan sistem authentication/login H'Leven yang SUDAH ADA.

User biasa yang sudah memiliki akun H'Leven dapat mengajukan diri menjadi Mitra Hotel.

==================================================
TUJUAN FITUR
==================================================

Flow yang diinginkan:

User
↓
Login H'Leven yang sudah ada
↓
Landing Page Mitra
↓
Klik "Daftar Sekarang"
↓
Form Pendaftaran Mitra bertahap
↓
Informasi Hotel
↓
Lokasi Hotel
↓
Data Pemilik/Penanggung Jawab
↓
Dokumen
↓
Informasi Rekening
↓
Review
↓
Kirim Pengajuan
↓
Pengajuan berhasil
↓
Tombol "Cek Status"
↓
Profile User
↓
Status Mitra

Status Mitra:

- Menunggu Verifikasi
- Sedang Ditinjau
- Membutuhkan Perbaikan
- Disetujui
- Ditolak

Jika Disetujui:

Profile User
↓
Status Mitra: Disetujui
↓
Tombol "Masuk ke Dashboard Hotel"
↓
Dashboard Admin Hotel

Jika Ditolak:
- tampilkan alasan penolakan.

Jika Membutuhkan Perbaikan:
- tampilkan alasan/perubahan yang diminta.
- user dapat kembali memperbaiki pengajuan.

==================================================
ATURAN PENTING SEBELUM CODING
==================================================

Sebelum membuat atau mengubah kode:

1. Periksa struktur project React + Vite yang sudah ada.

2. Periksa sistem routing yang sudah ada.

3. Periksa sistem authentication yang sudah ada.

4. Periksa API service/axios instance yang sudah digunakan.

5. Periksa endpoint backend yang SUDAH tersedia untuk:
   - user authentication
   - profile user
   - partner/mitra
   - hotel
   - application/pengajuan
   - upload dokumen
   - status pengajuan

6. Periksa dokumentasi project jika tersedia.

7. Cari apakah fitur Mitra Hotel sudah pernah dibuat sebagian.

8. Jangan membuat endpoint baru jika endpoint yang dibutuhkan sudah tersedia.

9. Jangan membuat database baru.

10. Jangan membuat sistem login baru.

11. Jangan membuat Dashboard Admin Hotel dalam task ini.

Jika endpoint backend belum tersedia, jangan langsung mengarang endpoint.

Catat endpoint yang belum tersedia dan jelaskan kebutuhan API tersebut.

Jika endpoint sebenarnya sudah tersedia dengan nama berbeda, gunakan endpoint yang sudah ada.

==================================================
TAHAP PENGERJAAN
==================================================

KERJAKAN DALAM URUTAN BERIKUT.

Jangan melompat ke tahap berikutnya sebelum tahap sebelumnya selesai dan tidak menghasilkan error.

==================================================
TAHAP 1 — AUDIT PROJECT
==================================================

Audit terlebih dahulu:

- struktur folder
- routing
- authentication
- API service
- user profile
- reusable UI components
- design system
- existing form components
- existing upload components

Jangan mengubah kode pada tahap ini.

Setelah audit, buat ringkasan:

A. File yang akan digunakan
B. File yang perlu dibuat
C. File yang perlu dimodifikasi
D. API yang sudah tersedia
E. API yang belum tersedia
F. Potensi konflik dengan fitur yang sudah ada

==================================================
TAHAP 2 — LANDING PAGE MITRA
==================================================

Buat halaman:

/mitra

Gunakan desain dari Google Stitch sebagai referensi utama jika tersedia.

Landing page hanya berisi informasi untuk calon mitra.

Section:

1. Navbar
2. Hero
3. Keuntungan menjadi Mitra
4. Cara Kerja
5. FAQ
6. Final CTA

Hero:

"Jadikan Hotel Anda Bagian dari H'Leven"

CTA:

"Daftar Sekarang"

Ketika user menekan "Daftar Sekarang":

- jika belum login → arahkan ke LOGIN H'LEVEN YANG SUDAH ADA.
- jika sudah login → langsung arahkan ke form pendaftaran Mitra.

Jangan membuat halaman login baru.

==================================================
TAHAP 3 — PROTEKSI AKSES FORM
==================================================

Route form Mitra harus membutuhkan user yang sudah login.

Jika user belum login:

/mitra/daftar

harus diarahkan ke login H'Leven yang sudah ada.

Jika user sudah login:

tampilkan form Mitra.

Gunakan authentication/route protection yang sudah ada.

Jangan membuat authentication mechanism baru.

==================================================
TAHAP 4 — FORM PENDAFTARAN MITRA
==================================================

Buat form multi-step.

Jangan membuat setiap step sebagai form yang benar-benar terpisah.

Gunakan satu state pengajuan agar data tidak hilang ketika berpindah step.

Progress:

1. Informasi Hotel
2. Lokasi
3. Pemilik
4. Dokumen
5. Rekening
6. Review

==================================================
STEP 1 — INFORMASI HOTEL
==================================================

Field:

- Nama Hotel
- Tipe Hotel
- Deskripsi Hotel
- Nomor Telepon Hotel
- Email Hotel
- Jumlah Kamar

Tipe Hotel:

- Hotel
- Resort
- Villa
- Guest House
- Boutique Hotel
- Lainnya

Validasi:
- required
- format email
- jumlah kamar harus angka
- nomor telepon valid

Button:

"Lanjutkan"

==================================================
STEP 2 — LOKASI HOTEL
==================================================

Field:

- Alamat Lengkap
- Provinsi
- Kota/Kabupaten
- Kecamatan
- Kode Pos
- Lokasi / Google Maps

Jika project sudah memiliki komponen lokasi/map, gunakan komponen tersebut.

Jika belum ada, buat UI yang kompatibel untuk integrasi API/map berikutnya.

Jangan memasukkan API key secara hardcode.

==================================================
STEP 3 — DATA PEMILIK
==================================================

Field:

- Nama Lengkap
- Email
- Nomor Telepon
- Nomor Identitas

Tambahkan helper text mengenai kebutuhan verifikasi.

==================================================
STEP 4 — DOKUMEN
==================================================

Dokumen:

1. KTP / Identitas Pemilik
2. Dokumen Legalitas Hotel
3. Dokumen Pendukung Lainnya

Periksa API upload yang sudah tersedia.

Jika tersedia:
gunakan API tersebut.

Jika belum:
buat abstraction/service layer yang siap dihubungkan ke API.

Jangan menganggap file sudah tersimpan di server hanya karena UI menunjukkan upload berhasil.

Tampilkan:

- nama file
- ukuran
- progress
- status
- error
- remove

==================================================
STEP 5 — INFORMASI REKENING
==================================================

Field:

- Nama Bank
- Nomor Rekening
- Nama Pemilik Rekening

Gunakan validasi yang sesuai dengan API/backend yang tersedia.

==================================================
STEP 6 — REVIEW
==================================================

Tampilkan seluruh data:

INFORMASI HOTEL
LOKASI
PEMILIK
DOKUMEN
REKENING

Setiap section memiliki:

"Edit"

User dapat kembali ke step terkait tanpa kehilangan data.

Tambahkan checkbox:

"Saya menyatakan bahwa seluruh informasi yang diberikan adalah benar dan dapat dipertanggungjawabkan."

Button:

"Kirim Pengajuan"

==================================================
TAHAP 5 — INTEGRASI SUBMIT API
==================================================

Sekarang hubungkan form dengan API backend yang sudah tersedia.

SEBELUM IMPLEMENTASI:

Periksa API contract terlebih dahulu.

Jangan menebak nama field.

Mapping field frontend ke backend dengan jelas.

Contoh:

Frontend:
hotelName

Backend mungkin:
hotel_name

Jika berbeda, lakukan mapping pada service layer.

Jangan mengubah API backend hanya karena nama field frontend berbeda.

Submit harus:

1. Validasi seluruh form.
2. Validasi dokumen.
3. Kirim data sesuai API contract.
4. Tangani loading.
5. Tangani validation error.
6. Tangani server error.
7. Tangani success response.

Jika API belum tersedia:

JANGAN membuat endpoint palsu.

Catat:

"API yang diperlukan tetapi belum tersedia."

==================================================
TAHAP 6 — PENGAJUAN BERHASIL
==================================================

Setelah API benar-benar mengembalikan success:

tampilkan:

"Pengajuan Berhasil Dikirim"

Tampilkan:

- nomor pengajuan jika diberikan backend
- nama hotel
- tanggal pengajuan
- status

Status awal:

"Menunggu Verifikasi"

Tambahkan button:

"Cek Status Pengajuan"

Button tersebut mengarah ke Profile User.

Jangan membuat halaman status terpisah jika Profile User sudah menjadi tempat status Mitra.

==================================================
TAHAP 7 — STATUS MITRA DI PROFILE
==================================================

Modifikasi halaman Profile User yang SUDAH ADA.

Jangan membuat profile baru.

Tambahkan section:

"Status Mitra Hotel"

Jika user belum pernah mengajukan:

Tampilkan:

"Anda belum menjadi mitra hotel."

Button:

"Daftar Menjadi Mitra"

Jika status:

PENDING

Tampilkan:

"Menunggu Verifikasi"

Jika status:

UNDER_REVIEW

Tampilkan:

"Sedang Ditinjau"

Jika status:

NEEDS_REVISION

Tampilkan:

"Membutuhkan Perbaikan"

Tampilkan:
- alasan
- informasi yang harus diperbaiki
- tombol "Perbaiki Pengajuan"

Jika status:

REJECTED

Tampilkan:

"Pengajuan Ditolak"

Tampilkan:
- alasan penolakan

Jika status:

APPROVED

Tampilkan:

"Hotel Anda Telah Disetujui"

Tampilkan tombol:

"Masuk ke Dashboard Hotel"

==================================================
TAHAP 8 — STATUS API
==================================================

Gunakan API backend yang sudah tersedia untuk mengambil status pengajuan.

Jangan menggunakan localStorage sebagai sumber kebenaran status.

Status harus berasal dari backend.

Jika backend menggunakan nama status berbeda, lakukan mapping pada frontend.

Contoh:

Backend:
pending

Frontend:
Menunggu Verifikasi

Backend:
approved

Frontend:
Disetujui

dan seterusnya.

==================================================
TAHAP 9 — PERBAIKAN PENGAJUAN
==================================================

Jika backend memberikan status:

needs_revision

user harus dapat:

1. Melihat alasan perbaikan.
2. Membuka kembali form.
3. Data sebelumnya tetap terisi.
4. Mengubah bagian yang diperlukan.
5. Mengirim ulang pengajuan.

Jangan membuat pengajuan baru jika backend menyediakan mekanisme update/revision.

Gunakan endpoint yang tersedia.

Jika endpoint update/revision belum tersedia, laporkan kebutuhan API tersebut.

==================================================
TAHAP 10 — APPROVED → DASHBOARD ADMIN HOTEL
==================================================

Jika status mitra:

approved

tampilkan:

"Masuk ke Dashboard Hotel"

Button tersebut mengarah ke Dashboard Admin Hotel yang SUDAH ADA.

Jangan membuat dashboard baru.

Gunakan route dan authentication/authorization yang sudah digunakan oleh Admin Hotel.

Jangan memberikan akses Dashboard Admin Hotel hanya berdasarkan frontend.

Akses sebenarnya harus tetap divalidasi oleh backend.

==================================================
ATURAN KEAMANAN
==================================================

Jangan:

- menyimpan password di localStorage
- menyimpan dokumen sensitif secara sembarangan
- menganggap status approved hanya berdasarkan frontend
- memberikan akses dashboard berdasarkan localStorage
- hardcode API key
- hardcode token
- membuat endpoint palsu
- membuat database baru

==================================================
ATURAN KOMPONEN
==================================================

Gunakan reusable component yang sudah tersedia.

Jika belum tersedia, buat reusable:

- PartnerStepper
- PartnerFormSection
- FileUpload
- StatusBadge
- ApplicationStatus

Jangan membuat komponen duplikat jika project sudah memiliki komponen dengan fungsi sama.

==================================================
RESPONSIVE
==================================================

Pastikan:

Desktop
Tablet
Mobile

semuanya berfungsi dengan baik.

Form harus nyaman digunakan di mobile.

==================================================
TESTING
==================================================

Setelah implementasi:

1. Jalankan build.
2. Periksa compile error.
3. Periksa console error.
4. Periksa route.
5. Periksa authentication.
6. Periksa form validation.
7. Periksa perpindahan step.
8. Periksa data tidak hilang.
9. Periksa submit API.
10. Periksa error API.
11. Periksa status dari backend.
12. Periksa status di Profile.
13. Periksa flow needs_revision.
14. Periksa flow rejected.
15. Periksa flow approved.
16. Periksa redirect ke Dashboard Admin Hotel.

==================================================
ATURAN TERAKHIR
==================================================

Jangan mengubah fitur di luar scope Mitra Hotel kecuali perubahan kecil memang diperlukan untuk:

- menambahkan status Mitra pada Profile User
- menghubungkan authentication yang sudah ada
- menghubungkan Dashboard Admin Hotel yang sudah ada

Jika menemukan API yang belum tersedia:

Jangan mengarang.

Berhenti pada bagian tersebut dan berikan:

1. API yang sudah tersedia.
2. API yang belum tersedia.
3. HTTP method yang dibutuhkan.
4. Endpoint yang dibutuhkan.
5. Request field yang dibutuhkan.
6. Response yang dibutuhkan.
7. Alasan API tersebut diperlukan.

Jika API sudah tersedia, langsung gunakan API tersebut.

Prioritas utama:
Jangan merusak fitur yang sudah berjalan.