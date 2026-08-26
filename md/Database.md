==================================================
ATURAN DATABASE — WAJIB
==================================================

PENTING:

Jangan pernah membuat, mengubah, atau menambahkan tabel database secara otomatis tanpa memberitahu saya terlebih dahulu.

Jika selama implementasi fitur Mitra Hotel ditemukan kebutuhan database baru, BERHENTI sebelum membuat migration atau mengubah database.

Berikan laporan terlebih dahulu dengan format:

DATABASE CHANGE REQUEST

1. Apakah membutuhkan tabel baru?
2. Nama tabel:
3. Alasan tabel diperlukan:
4. Kolom yang dibutuhkan:
   - nama kolom
   - tipe data
   - nullable / tidak
   - default value jika ada
   - primary key / foreign key jika ada

5. Relasi:
   - tabel apa yang menjadi parent?
   - tabel apa yang menjadi child?
   - jenis relasi:
     - one-to-one
     - one-to-many
     - many-to-many

6. Foreign key:
   - nama kolom foreign key
   - mengarah ke tabel mana
   - mengarah ke kolom mana

7. Apakah tabel sebenarnya sudah tersedia?
8. Apakah kebutuhan tersebut bisa menggunakan tabel yang sudah ada?
9. Apakah migration baru diperlukan?
10. Apakah perubahan ini berdampak pada API yang sudah ada?

Contoh:

DATABASE CHANGE REQUEST

Nama tabel:
partner_applications

Alasan:
Menyimpan data pengajuan user untuk menjadi mitra hotel.

Relasi:

users
  │
  │ 1
  │
  │
  │ N
partner_applications

Foreign key:
partner_applications.user_id
→ users.id

Jenis relasi:
users 1 : N partner_applications

Status:
pending
under_review
needs_revision
approved
rejected

JANGAN membuat migration sebelum saya menyetujui perubahan tersebut.

==================================================
ATURAN PRIORITAS DATABASE
==================================================

Sebelum mengusulkan tabel baru:

1. Periksa seluruh tabel database yang sudah tersedia.
2. Periksa migration yang sudah ada.
3. Periksa model/entity yang sudah ada.
4. Periksa relasi yang sudah ada.
5. Periksa API yang sudah menggunakan tabel tersebut.

Jika tabel yang dibutuhkan sudah ada:

JANGAN membuat tabel baru.

Gunakan tabel yang sudah ada dan jelaskan bagaimana tabel tersebut dapat digunakan.

Jika hanya membutuhkan kolom tambahan:

Jangan membuat tabel baru.

Laporkan:

DATABASE CHANGE REQUEST

Tabel:
[nama tabel]

Kolom baru:
[nama kolom]

Alasan:
[alasan]

Relasi:
[apakah ada perubahan relasi]

Migration:
[diperlukan / tidak diperlukan]

Tetap tunggu persetujuan sebelum mengubah database.

==================================================
ATURAN RELASI
==================================================

Setiap tabel baru WAJIB dijelaskan relasinya.

Jangan membuat tabel yang berdiri sendiri tanpa alasan.

Contoh format:

users
  │
  ├── 1:N → partner_applications
  │
  └── 1:1 → user_profiles

partner_applications
  │
  ├── 1:1 → hotels
  │
  └── 1:N → partner_documents

Jika hubungan tersebut belum pasti berdasarkan database yang tersedia:

Jangan menebak.

Tanyakan atau laporkan kebutuhan tersebut terlebih dahulu.

==================================================
ATURAN FRONTEND
==================================================

Frontend tidak boleh membuat database.

Jika frontend menemukan bahwa sebuah fitur membutuhkan data yang belum tersedia dari API:

Jangan membuat database dari sisi frontend.

Laporkan kepada saya bahwa backend membutuhkan perubahan.

Contoh:

"Frontend membutuhkan status pengajuan mitra, tetapi API saat ini belum menyediakan field/status tersebut."

Kemudian jelaskan kebutuhan API-nya.

==================================================
ATURAN BACKEND
==================================================

Jika perubahan backend membutuhkan database baru:

Jangan langsung membuat migration.

Berikan DATABASE CHANGE REQUEST terlebih dahulu.

Setelah saya menyetujui:

baru boleh:
- membuat migration
- membuat model
- membuat relationship
- membuat controller/service
- membuat endpoint
- melakukan testing

==================================================
PRINSIP UTAMA
==================================================

DATABASE EXISTING FIRST.

Selalu gunakan database dan tabel yang sudah ada jika memungkinkan.

Jangan membuat tabel baru hanya karena lebih mudah untuk coding.

Setiap tabel baru harus mempunyai alasan yang jelas dan relasi yang jelas.

Tidak boleh ada perubahan database tanpa persetujuan.