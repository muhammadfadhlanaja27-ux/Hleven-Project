# Database Rules & Governance

## 1. Tujuan

File ini berisi aturan wajib yang harus diikuti oleh AI/Antigravity ketika melakukan perubahan pada database.

Tujuan utama:

* Mencegah pembuatan tabel secara sembarangan.
* Memastikan setiap tabel memiliki tujuan yang jelas.
* Memastikan setiap relasi antar tabel sudah ditentukan sebelum implementasi.
* Menghindari duplikasi data dan tabel.
* Menjaga konsistensi struktur database dengan ERD dan business flow.
* Memastikan perubahan database mendapat persetujuan terlebih dahulu.

---

# 2. Aturan Utama: DILARANG Membuat Tabel Tanpa Izin

**Antigravity WAJIB meminta izin terlebih dahulu sebelum membuat:**

* Database baru.
* Table baru.
* Kolom baru yang mengubah struktur penting.
* Foreign key baru.
* Relasi baru.
* Pivot table.
* Junction table untuk relasi many-to-many.
* Perubahan struktur yang dapat memengaruhi tabel lain.

### Prosedur wajib

Sebelum membuat tabel baru, Antigravity harus menjelaskan:

1. Nama tabel.
2. Tujuan tabel.
3. Alasan tabel tersebut diperlukan.
4. Kolom yang akan dibuat.
5. Primary key.
6. Foreign key.
7. Relasi dengan tabel lain.
8. Cardinality setiap relasi.
9. Tabel mana yang menjadi parent dan child.
10. Dampak terhadap tabel atau fitur yang sudah ada.

Setelah penjelasan diberikan, **berhenti dan tunggu persetujuan user.**

Jangan membuat migration, model, SQL, atau melakukan perubahan database sebelum user memberikan persetujuan.

---

# 3. Format Permintaan Izin

Sebelum membuat tabel baru, gunakan format berikut:

```text
DATABASE CHANGE REQUEST

Table:
[nama_table]

Purpose:
[jelaskan fungsi tabel]

Reason:
[jelaskan kenapa tabel diperlukan]

Columns:
- id
- ...
- ...

Primary Key:
[nama primary key]

Foreign Keys:
- [column] -> [table].[column]

Relationships:
- [table A] 1:N [table B]
- [table B] N:1 [table C]

Parent:
[nama tabel parent]

Child:
[nama tabel child]

Impact:
[jelaskan tabel/fitur yang terdampak]

Apakah struktur ini disetujui untuk dibuat?
```

Setelah itu **STOP**.

Tidak boleh melanjutkan implementasi sampai user menjawab bahwa perubahan tersebut disetujui.

---

# 4. Aturan Menentukan Relasi

Setiap foreign key harus memiliki alasan yang jelas.

Antigravity tidak boleh membuat foreign key hanya karena dua tabel memiliki informasi yang terlihat berhubungan.

Setiap relasi harus menjawab:

> "Data ini sebenarnya dimiliki oleh siapa?"

dan:

> "Apakah satu data dapat memiliki banyak data lain?"

---

# 5. Relasi One-to-Many (1:N)

Gunakan relasi `1:N` apabila:

* Satu record pada tabel A dapat memiliki banyak record pada tabel B.
* Setiap record pada tabel B hanya dimiliki oleh satu record pada tabel A.

Contoh:

```text
hotels
   |
   | 1:N
   |
room_types
```

Artinya:

* Satu hotel dapat memiliki banyak room type.
* Satu room type hanya dimiliki oleh satu hotel.

Struktur:

```text
hotels
- id
- name

room_types
- id
- hotel_id FK -> hotels.id
- name
```

Foreign key berada di tabel yang memiliki sisi **N/many**.

---

# 6. Relasi Many-to-One (N:1)

`N:1` adalah cara melihat relasi `1:N` dari arah sebaliknya.

Contoh:

```text
room_types
   |
   | N:1
   |
hotels
```

Artinya:

* Banyak room type dapat dimiliki oleh satu hotel.

Dalam database, foreign key tetap berada pada tabel `room_types`.

```text
room_types.hotel_id
        ↓
hotels.id
```

---

# 7. Relasi One-to-One (1:1)

Gunakan `1:1` hanya jika:

* Satu record pada tabel A hanya memiliki satu record pada tabel B.
* Satu record pada tabel B hanya memiliki satu record pada tabel A.

Contoh:

```text
users
   |
   | 1:1
   |
user_profiles
```

Jika digunakan:

```text
user_profiles
- id
- user_id FK -> users.id UNIQUE
```

Foreign key harus memiliki constraint `UNIQUE` apabila relasi memang benar-benar `1:1`.

Jangan menggunakan `1:1` hanya karena saat ini data kebetulan hanya memiliki satu record.

---

# 8. Relasi Many-to-Many (N:N)

Gunakan `N:N` apabila:

* Satu record A dapat berhubungan dengan banyak record B.
* Satu record B dapat berhubungan dengan banyak record A.

Contoh:

```text
hotels
   |
   | N:N
   |
facilities
```

Satu hotel dapat memiliki banyak fasilitas.

Satu fasilitas juga dapat dimiliki oleh banyak hotel.

Maka diperlukan pivot/junction table:

```text
hotel_facilities
- id
- hotel_id FK -> hotels.id
- facility_id FK -> facilities.id
```

Relasi:

```text
hotels
   1
   |
   N
hotel_facilities
   N
   |
   1
facilities
```

Antigravity harus menjelaskan kebutuhan pivot table sebelum membuatnya.

---

# 9. Menentukan Arah Foreign Key

Aturan utama:

> Foreign key berada pada tabel yang membutuhkan referensi terhadap tabel lain.

Contoh:

```text
hotels
- id

room_types
- id
- hotel_id
```

Relasinya:

```text
room_types.hotel_id
        ↓
hotels.id
```

Bukan:

```text
hotels.room_type_id
```

karena satu hotel dapat memiliki banyak room type.

---

# 10. Jangan Membuat Tabel Duplikat

Sebelum membuat tabel baru, Antigravity **WAJIB memeriksa database yang sudah ada.**

Periksa:

* Apakah tabel dengan fungsi yang sama sudah ada?
* Apakah tabel yang mirip sudah ada?
* Apakah kebutuhan tersebut sebenarnya dapat menggunakan tabel yang sudah tersedia?
* Apakah kolom yang dibutuhkan sebenarnya sudah tersedia?
* Apakah relasi tersebut sudah dibuat sebelumnya?

Jika sudah ada tabel yang memiliki fungsi serupa, **jangan membuat tabel baru.**

Jelaskan terlebih dahulu perbedaannya dan minta persetujuan user jika memang diperlukan tabel tambahan.

---

# 11. Jangan Membuat Tabel Hanya Karena Membutuhkan Data Baru

Tidak setiap kebutuhan data berarti harus membuat tabel baru.

Contoh:

Jika membutuhkan:

```text
hotel_phone
```

jangan langsung membuat:

```text
hotel_phones
```

Periksa terlebih dahulu apakah:

```text
hotels.phone
```

sudah cukup.

Tabel baru hanya dibuat apabila kebutuhan tersebut memang membutuhkan entitas/data terpisah.

---

# 12. Setiap Tabel Harus Memiliki Entitas yang Jelas

Setiap tabel harus menjawab:

> "Tabel ini merepresentasikan apa?"

Contoh yang benar:

```text
users
hotels
room_types
bookings
payments
reviews
facilities
vouchers
```

Contoh yang perlu dipertanyakan:

```text
hotel_data
booking_data
temporary_data
misc_data
```

Nama tabel harus merepresentasikan entitas atau konsep bisnis yang jelas.

---

# 13. Aturan Primary Key

Setiap tabel wajib memiliki primary key.

Default:

```text
id
```

Primary key harus:

* Unique.
* Tidak nullable.
* Stabil.
* Tidak bergantung pada data yang dapat berubah.

Jangan menggunakan nama, email, nomor telepon, atau atribut bisnis yang dapat berubah sebagai primary key tanpa alasan yang sangat jelas.

---

# 14. Aturan Foreign Key

Setiap foreign key wajib menjelaskan:

```text
source_table.source_column
        ↓
target_table.target_column
```

Contoh:

```text
bookings.user_id
        ↓
users.id
```

Antigravity harus menjelaskan:

```text
bookings.user_id -> users.id
```

sebelum membuat relasi tersebut.

---

# 15. Aturan Cascade dan Delete

Antigravity tidak boleh menentukan:

```text
CASCADE
SET NULL
RESTRICT
NO ACTION
```

secara sembarangan.

Sebelum menentukan behavior ketika parent dihapus, jelaskan dampaknya.

Contoh:

```text
users
  ↓
bookings
```

Jika user dihapus:

* Apakah booking ikut dihapus?
* Apakah booking harus tetap tersimpan?
* Apakah `user_id` boleh menjadi `NULL`?

Untuk data transaksi seperti booking, payment, atau invoice, **jangan menggunakan cascade delete tanpa persetujuan user.**

---

# 16. Perubahan Database yang Sudah Ada

Jika tabel sudah ada, Antigravity tetap harus meminta izin sebelum melakukan perubahan struktur yang signifikan.

Contoh perubahan yang membutuhkan izin:

```text
ADD TABLE
DROP TABLE
DROP COLUMN
RENAME TABLE
RENAME COLUMN
ADD FOREIGN KEY
REMOVE FOREIGN KEY
CHANGE COLUMN TYPE
CHANGE RELATIONSHIP
CHANGE UNIQUE CONSTRAINT
CHANGE CASCADE BEHAVIOR
```

Jangan langsung menjalankan migration.

---

# 17. Urutan Implementasi

Jika perubahan sudah disetujui, implementasi harus dilakukan dengan urutan:

```text
1. Database structure
2. Migration
3. Foreign keys / constraints
4. Model / ORM relationship
5. Seeder jika diperlukan
6. API / backend logic
7. Frontend integration
8. Testing
```

Jangan membuat frontend berdasarkan struktur database yang belum disetujui.

---

# 18. Sinkronisasi dengan ERD

Database harus konsisten dengan ERD.

Sebelum membuat perubahan:

```text
Business Requirement
        ↓
Business Flow
        ↓
ERD
        ↓
Database
        ↓
Migration
        ↓
Application
```

Jika struktur database yang dibutuhkan tidak sesuai dengan ERD, **jangan langsung mengubah database.**

Laporkan perbedaannya kepada user.

Contoh:

```text
ERD menunjukkan:

hotels 1:N room_types

Namun implementasi saat ini tidak memiliki
room_types.hotel_id.

Diperlukan perubahan struktur database.

DATABASE CHANGE REQUEST diperlukan sebelum
migration dibuat.
```

---

# 19. Jika Tidak Yakin

Jika Antigravity tidak yakin apakah:

* perlu tabel baru,
* perlu foreign key,
* perlu pivot table,
* relasinya 1:1,
* relasinya 1:N,
* relasinya N:N,
* atau data seharusnya berada di tabel mana,

**JANGAN MENEBak.**

Berhenti dan minta klarifikasi.

Lebih baik meminta satu persetujuan daripada membuat tiga tabel yang kemudian harus dibongkar. Manusia sudah cukup sering melakukan ini tanpa bantuan AI.

---

# 20. Checklist Sebelum Membuat Tabel

Sebelum membuat tabel baru, pastikan:

* [ ] Tabel belum tersedia.
* [ ] Tujuan tabel sudah jelas.
* [ ] Entitas yang direpresentasikan sudah jelas.
* [ ] Alasan pembuatan tabel sudah jelas.
* [ ] Semua kolom sudah ditentukan.
* [ ] Primary key sudah ditentukan.
* [ ] Foreign key sudah ditentukan.
* [ ] Parent table sudah ditentukan.
* [ ] Child table sudah ditentukan.
* [ ] Cardinality sudah ditentukan.
* [ ] Relasi sudah dijelaskan.
* [ ] Cascade behavior sudah dipertimbangkan.
* [ ] Tidak ada duplikasi dengan tabel lain.
* [ ] Struktur sesuai dengan ERD.
* [ ] User sudah memberikan persetujuan.

**Jika user belum memberikan persetujuan, jangan membuat atau mengubah database.**

---

# 21. Aturan Mutlak

Aturan berikut bersifat **MANDATORY**:

> **NO DATABASE CHANGE WITHOUT APPROVAL.**

Antigravity tidak boleh:

```text
❌ Membuat tabel baru tanpa izin.
❌ Membuat migration tabel baru tanpa izin.
❌ Membuat foreign key baru tanpa izin.
❌ Membuat pivot table tanpa izin.
❌ Mengubah relasi tanpa izin.
❌ Menghapus tabel tanpa izin.
❌ Menghapus kolom tanpa izin.
❌ Menebak relasi database.
❌ Membuat tabel yang memiliki fungsi sama dengan tabel existing.
```

Antigravity harus:

```text
✅ Memeriksa struktur database terlebih dahulu.
✅ Menjelaskan alasan perubahan.
✅ Menjelaskan struktur tabel.
✅ Menjelaskan relasi.
✅ Menjelaskan cardinality.
✅ Menjelaskan foreign key.
✅ Menjelaskan dampak perubahan.
✅ Meminta approval.
✅ Baru melakukan implementasi setelah approval.
```

---

# 22. Prinsip Utama

Gunakan prinsip berikut dalam setiap perubahan database:

```text
CHECK
  ↓
ANALYZE
  ↓
EXPLAIN
  ↓
REQUEST APPROVAL
  ↓
WAIT
  ↓
IMPLEMENT
  ↓
VERIFY
```

**Tidak boleh melewati tahap `REQUEST APPROVAL` dan `WAIT`.**
