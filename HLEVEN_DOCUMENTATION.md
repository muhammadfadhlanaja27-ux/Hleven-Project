# H'Leven

## Hotel Booking Platform

Version : 1.0.0

Document Type : Software Requirement Specification (SRS)

Project Status : Development

Prepared By :

- Backend Developer 1
- Backend Developer 2
- Frontend Developer

Institution :

SMKN 11 Bandung

---

# Document Information

| Item | Description |
|------|-------------|
| Project Name | H'Leven |
| Project Type | Hotel Booking Platform |
| Platform | Web Application |
| Frontend | React + Vite |
| Backend | Laravel 12 |
| Database | PostgreSQL (Supabase) |
| Payment Gateway | Midtrans |
| Maps | OpenStreetMap + Leaflet |
| Version | 1.0 |
| Architecture | REST API |

---

# Revision History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | - | Initial Documentation |


# Table of Contents

1. Project Overview
2. Technology Stack
3. Development Team
4. Development Workflow
5. Git Workflow
6. Folder Structure
7. User Roles
8. Functional Requirements
9. Non Functional Requirements
10. Business Rules
11. Database Design
12. Table Documentation
13. API Design
14. Authentication Flow
15. Hotel Management Flow
16. Booking Flow
17. Payment Flow
18. Review Flow
19. Dashboard Flow
20. Maps Flow
21. Backend Architecture
22. Frontend Architecture
23. Coding Standard
24. Testing
25. Deployment
26. Future Development
27. Appendix



# 1. Project Overview

## 1.1 Background

H'Leven merupakan platform pemesanan hotel berbasis web yang dikembangkan untuk memudahkan pengguna dalam mencari, membandingkan, dan memesan hotel secara online.

Selain menyediakan layanan pemesanan hotel bagi pengguna, H'Leven juga menyediakan sistem manajemen hotel bagi mitra serta sistem pengawasan oleh Super Admin.

Sistem dikembangkan menggunakan arsitektur REST API sehingga Frontend dan Backend dapat dikembangkan secara terpisah.

---

## 1.2 Objectives

Tujuan utama pengembangan H'Leven adalah:

- Mempermudah proses pencarian hotel.
- Mempermudah proses reservasi hotel.
- Memberikan sistem manajemen hotel kepada Admin Hotel.
- Memberikan sistem monitoring kepada Super Admin.
- Mengintegrasikan pembayaran online menggunakan Midtrans.
- Menyediakan dashboard yang informatif untuk setiap role.

---

## 1.3 Scope

Ruang lingkup sistem meliputi:

- Authentication
- Hotel Management
- Room Management
- Booking Management
- Payment
- Review
- Dashboard
- Notification
- Partner Registration
- Super Admin Management

---

## 1.4 Target Users

H'Leven memiliki empat jenis pengguna utama.

- Guest
- User
- Admin Hotel
- Super Admin

# 2. Technology Stack

## 2.1 Frontend

Framework

- React
- Vite

Library

- React Router
- Axios
- TailwindCSS
- React Hook Form

---

## 2.2 Backend

Framework

- Laravel 12

Authentication

- Laravel Sanctum

Storage

- Supabase Storage

HTTP Client

- Laravel HTTP Client

Queue

- Database Queue

---

## 2.3 Database

Database Engine

- PostgreSQL

Provider

- Supabase

Normalization

- Third Normal Form (3NF)

---

## 2.4 Payment Gateway

Midtrans

Payment Method

- QRIS

---

## 2.5 Maps

OpenStreetMap

Library

Leaflet.js

---

## 2.6 Version Control

Git

Repository

GitHub

# Judul Bab

## Tujuan

Menjelaskan tujuan dari bab ini.

---

## Deskripsi

Penjelasan umum mengenai topik.

---

## Struktur

Diagram atau daftar komponen.

---

## Penjelasan Detail

Subbab yang menjelaskan setiap bagian.

---

## Business Rules

Aturan bisnis yang berkaitan.

---

## Catatan Implementasi

Hal-hal yang harus diperhatikan saat pengembangan.

# 3. Development Team

## 3.1 Team Structure

Tim pengembangan H'Leven terdiri dari tiga orang dengan pembagian tanggung jawab berdasarkan domain sistem. Pembagian ini bertujuan untuk mengurangi konflik saat pengembangan, memperjelas kepemilikan modul, serta mempercepat proses integrasi antara Backend dan Frontend.

```
                    Project Manager
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Backend Developer 1  Backend Developer 2  Frontend Developer
```

Setiap anggota memiliki area kerja yang berbeda sehingga proses pengembangan dapat berjalan secara paralel.

---

## 3.2 Backend Developer 1

### Role

Core Business & Hotel Management

### Responsibilities

Backend Developer 1 bertanggung jawab terhadap seluruh business logic utama sistem dan seluruh fitur yang digunakan oleh Admin Hotel.

Modul yang menjadi tanggung jawab meliputi:

- Authentication
- User Profile
- Hotel Management
- Room Management
- Facility Management
- Booking Management
- Database Design
- REST API
- Business Logic
- Dashboard Admin Hotel

### Authentication

Mengembangkan fitur:

- Register
- Login
- Logout
- Change Password
- Update Profile

### Hotel Management

Mengembangkan:

- CRUD Hotel
- Edit Informasi Hotel
- Detail Hotel

### Room Management

Mengembangkan:

- CRUD Room
- Room Capacity
- Room Price
- Room Stock

### Facility Management

Mengembangkan:

- CRUD Facility
- Hotel Facility
- Room Facility

### Booking Management

Mengembangkan:

- Booking
- Booking Detail
- Booking History
- Cancel Booking
- Booking Validation

### Business Logic

Mengembangkan seluruh logika bisnis utama sistem seperti:

- Perhitungan harga weekday
- Perhitungan harga weekend
- Total pembayaran
- Validasi ketersediaan kamar
- Validasi tanggal booking

### Dashboard Admin Hotel

Mengembangkan endpoint dashboard Admin Hotel seperti:

- Total Booking
- Booking Hari Ini
- Pendapatan
- Jumlah Kamar
- Tingkat Hunian
- Rating Hotel

### Database

Bertanggung jawab terhadap:

- Migration
- Seeder
- Factory
- Model
- Relationship
- Resource
- Form Request Validation

---

## 3.3 Backend Developer 2

### Role

System Integration, Super Admin & Frontend Support

### Responsibilities

Backend Developer 2 bertanggung jawab terhadap seluruh fitur Super Admin, integrasi layanan pihak ketiga, serta membantu proses integrasi Frontend.

Modul yang menjadi tanggung jawab meliputi:

- Super Admin
- Midtrans
- QR Code
- Storage
- Notification
- Activity Log
- Partner Management
- Warning Management
- Dashboard Super Admin
- Room Availability Engine
- Frontend Integration

### Super Admin

Mengembangkan:

- Dashboard Super Admin
- CRUD User
- CRUD Admin Hotel
- Approve Hotel
- Reject Hotel
- Suspend Hotel
- Activate Hotel

### Partner Management

Mengembangkan:

- Partner Registration Review
- Approval
- Rejection
- Detail Partner

### Warning Management

Mengembangkan:

- Create Warning
- Update Warning
- Delete Warning
- View Warning

### Payment Integration

Mengembangkan integrasi Midtrans:

- Snap Token
- Callback
- Payment Status
- Payment Verification

### QR Code

Mengembangkan:

- Generate QR Code
- QR Verification

### Storage

Mengembangkan:

- Upload Hotel Photo
- Upload Room Photo
- Upload Avatar
- Delete File

### Notification

Mengembangkan:

- Notification API
- Read Notification
- Broadcast Notification

### Activity Log

Mengembangkan:

- Login Log
- Booking Log
- Payment Log
- Admin Activity

### Room Availability Engine

Mengembangkan:

- Reduce Stock
- Restore Stock
- Daily Availability Update

### Dashboard Super Admin

Mengembangkan endpoint:

- Total User
- Total Hotel
- Total Booking
- Revenue
- Pending Hotel
- User Growth

### Frontend Collaboration

Backend Developer 2 juga bertanggung jawab membantu Frontend Developer pada proses integrasi.

Tugas meliputi:

- Integrasi React dengan Laravel REST API
- Integrasi Midtrans pada Frontend
- Integrasi Upload File
- Dokumentasi API
- API Testing menggunakan Postman atau Bruno
- Penyediaan Mock Data
- Membantu debugging proses integrasi Frontend

---

## 3.4 Frontend Developer

### Role

User Interface & User Experience

### Responsibilities

Frontend Developer bertanggung jawab terhadap seluruh tampilan sistem menggunakan React.

Modul yang menjadi tanggung jawab meliputi:

- Landing Page
- Authentication Page
- Hotel Page
- Room Page
- Booking Page
- Payment Page
- Dashboard
- Responsive Design
- State Management
- API Integration

### Authentication UI

Mengembangkan:

- Login Page
- Register Page
- Forgot Password (Future Development)

### Landing Page

Mengembangkan:

- Hero Section
- Search Hotel
- Popular Hotel
- Featured Hotel
- Footer

### Hotel Page

Mengembangkan:

- Hotel List
- Hotel Detail
- Filter
- Search

### Booking Page

Mengembangkan:

- Booking Form
- Guest Form
- Booking Summary

### Payment Page

Mengembangkan:

- Midtrans Snap
- Payment Status

### Dashboard

Mengembangkan:

- Dashboard Admin Hotel
- Dashboard Super Admin
- Dashboard User

### State Management

Mengembangkan:

- Authentication State
- User State
- Hotel State
- Booking State
- Payment State

### Responsive Design

Menyesuaikan tampilan untuk:

- Desktop
- Tablet
- Mobile

---

## 3.5 Collaboration Rules

Seluruh anggota tim wajib mengikuti aturan berikut:

1. Menggunakan Git Flow.
2. Setiap fitur dikembangkan pada branch terpisah.
3. Tidak melakukan commit langsung ke branch `main`.
4. Seluruh Pull Request harus melalui proses review.
5. API yang digunakan Frontend harus mengikuti dokumentasi yang telah disepakati.
6. Setiap perubahan database harus dikomunikasikan kepada seluruh anggota tim.
7. Seluruh endpoint harus didokumentasikan sebelum digunakan oleh Frontend.

---

## 3.6 Responsibility Matrix

| Module | Backend 1 | Backend 2 | Frontend |
|----------|:---------:|:---------:|:--------:|
| Authentication | ✅ | | ✅ |
| Hotel | ✅ | | ✅ |
| Room | ✅ | | ✅ |
| Facility | ✅ | | ✅ |
| Booking | ✅ | | ✅ |
| Guest | ✅ | | ✅ |
| Review | ✅ | | ✅ |
| Midtrans | | ✅ | ✅ |
| QR Code | | ✅ | ✅ |
| Storage | | ✅ | |
| Notification | | ✅ | ✅ |
| Activity Log | | ✅ | |
| Partner | | ✅ | ✅ |
| Warning | | ✅ | ✅ |
| Dashboard Admin Hotel | ✅  |
| Dashboard Super Admin | | ✅  |
| API Documentation | | ✅ | |
| API Testing | | ✅ | |
| Mock Data | | ✅ | |
| Frontend Integration | | ✅ | ✅ |


# 4. Development Workflow

## 4.1 Development Methodology

Pengembangan H'Leven menggunakan metode **Incremental Development**, yaitu sistem dikembangkan secara bertahap berdasarkan prioritas fitur.

Setiap fitur akan melewati beberapa tahapan mulai dari perancangan hingga pengujian sebelum diintegrasikan ke dalam sistem utama.

Tahapan pengembangan terdiri dari:

1. Requirement Analysis
2. System Design
3. Database Design
4. Backend Development
5. Frontend Development
6. Integration Testing
7. User Acceptance Testing
8. Deployment

---

## 4.2 Development Flow

Seluruh anggota tim mengikuti alur pengembangan berikut.

```
Requirement Analysis
        │
        ▼
Project Documentation
        │
        ▼
ERD & Database Design
        │
        ▼
API Design
        │
        ▼
Backend Development
        │
        ▼
Frontend Development
        │
        ▼
API Integration
        │
        ▼
Testing
        │
        ▼
Bug Fixing
        │
        ▼
Deployment
```

---

## 4.3 Development Principles

Seluruh pengembangan sistem harus mengikuti prinsip berikut:

- Setiap fitur dikembangkan berdasarkan dokumentasi.
- Database menjadi sumber utama seluruh business logic.
- REST API menjadi media komunikasi antara Backend dan Frontend.
- Setiap endpoint harus terdokumentasi.
- Tidak diperbolehkan mengubah struktur database tanpa persetujuan tim.
- Seluruh kode harus mengikuti Coding Standard yang telah ditentukan.
- Seluruh fitur wajib diuji sebelum dilakukan merge ke branch `develop`.

---

## 4.4 Development Priority

Pengembangan dilakukan berdasarkan urutan prioritas berikut.

### Priority 1

Core System

- Authentication
- User Management
- Hotel
- Room
- Facility
- Booking

---

### Priority 2

Business Feature

- Payment Midtrans
- QR Code
- Dashboard
- Notification
- Activity Log
- Review

---

### Priority 3

System Enhancement

- Search
- Filter
- Maps
- Reporting
- Performance Optimization

---

### Priority 4

Future Development

- Google OAuth
- Email OTP
- Email Verification
- Voucher
- Promotion
- AI Recommendation
- Dynamic Pricing

---

# 5. Git Workflow

## 5.1 Branch Structure

Repository menggunakan Git Flow.

```
main
│
└── develop
      │
      ├── feature/backend-auth
      ├── feature/backend-booking
      ├── feature/backend-payment
      ├── feature/frontend-dashboard
      ├── feature/frontend-booking
      └── feature/frontend-auth
```

---

## 5.2 Branch Description

### main

Branch production.

Hanya berisi kode yang telah stabil dan siap digunakan.

---

### develop

Branch utama selama proses pengembangan.

Seluruh fitur akan digabungkan terlebih dahulu ke branch ini.

---

### feature

Digunakan untuk mengembangkan satu fitur tertentu.

Contoh:

- feature/backend-auth
- feature/backend-booking
- feature/backend-room
- feature/frontend-home
- feature/frontend-dashboard

---

### hotfix

Digunakan apabila terdapat bug pada branch `main`.

Contoh:

```
hotfix/payment-callback
```

---

## 5.3 Branch Naming Convention

Gunakan format berikut.

Backend

```
feature/backend-auth
feature/backend-booking
feature/backend-room
feature/backend-hotel
feature/backend-payment
```

Frontend

```
feature/frontend-home
feature/frontend-login
feature/frontend-dashboard
feature/frontend-booking
```

Bug

```
bugfix/login-error
bugfix/payment
```

Hotfix

```
hotfix/payment
```

---

## 5.4 Commit Message Convention

Gunakan format berikut.

Feature

```
feat: add booking API
```

Bug

```
fix: resolve payment callback bug
```

Update

```
update: improve dashboard statistics
```

Refactor

```
refactor: optimize booking service
```

Documentation

```
docs: update ERD documentation
```

Style

```
style: format booking controller
```

---

## 5.5 Pull Request Workflow

Sebelum melakukan merge ke branch `develop`, setiap developer wajib:

1. Melakukan `git pull` pada branch `develop`.
2. Menyelesaikan konflik apabila ada.
3. Memastikan seluruh fitur berjalan dengan baik.
4. Membuat Pull Request.
5. Melakukan code review bersama anggota tim.
6. Setelah disetujui, baru dilakukan merge ke `develop`.

Branch `main` hanya diperbarui ketika seluruh fitur pada checkpoint telah selesai dan dinyatakan stabil.

---

## 5.6 Merge Rules

Tidak diperbolehkan:

- Push langsung ke `main`.
- Mengubah migration milik developer lain tanpa koordinasi.
- Mengubah endpoint yang telah digunakan Frontend tanpa pemberitahuan.
- Menghapus branch sebelum fitur selesai diuji.

---

## 5.7 Code Review Rules

Sebelum Pull Request disetujui, lakukan pemeriksaan berikut:

### Backend

- Endpoint berjalan dengan baik.
- Validasi sudah diterapkan.
- Response API konsisten.
- Error handling tersedia.
- Tidak terdapat query yang tidak diperlukan.

### Frontend

- Tampilan responsif.
- Tidak terdapat error pada browser.
- API berhasil terintegrasi.
- Form validation berjalan.
- Loading dan error state tersedia.

---

## 5.8 Definition of Done

Sebuah fitur dinyatakan selesai apabila memenuhi seluruh kriteria berikut:

- Kode berhasil dikembangkan.
- Tidak terdapat error pada proses build.
- Database telah diperbarui (jika diperlukan).
- API telah diuji.
- Frontend telah terintegrasi.
- Dokumentasi diperbarui.
- Pull Request telah disetujui.
- Berhasil di-merge ke branch `develop`.

# 6. Project Structure

## 6.1 Overview

H'Leven menggunakan arsitektur **Client-Server** dengan pemisahan antara Backend dan Frontend.

Backend dikembangkan menggunakan Laravel sebagai REST API, sedangkan Frontend menggunakan React sebagai Single Page Application (SPA).

```
H'Leven
│
├── backend/
└── frontend/
```

---

# 6.2 Backend Structure

Backend dibangun menggunakan Laravel 12 dengan pendekatan RESTful API.

```
backend/
│
├── app/
│
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
│
├── Models/
│
├── Services/
│
├── Repositories/
│
├── Providers/
│
├── Jobs/
│
├── Policies/
│
├── Traits/
│
├── Enums/
│
├── Helpers/
│
└── Exceptions/
│
├── bootstrap/
│
├── config/
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── public/
│
├── routes/
│   ├── api.php
│   └── web.php
│
├── storage/
│
├── tests/
│
└── vendor/
```

---

# 6.3 App Directory

Folder `app` merupakan inti dari aplikasi Laravel.

```
app/
│
├── Http/
├── Models/
├── Services/
├── Repositories/
├── Jobs/
├── Policies/
├── Traits/
├── Enums/
└── Helpers/
```

---

# 6.4 Controllers

Controller bertugas menerima request dari client kemudian meneruskannya ke Service.

```
app/Http/Controllers/

AuthenticationController

HotelController

RoomController

BookingController

PaymentController

DashboardController

ReviewController

PartnerController

NotificationController

WarningController
```

Controller **tidak boleh** berisi business logic yang kompleks.

---

# 6.5 Services

Service bertugas menjalankan business logic aplikasi.

```
app/Services/

AuthenticationService

HotelService

RoomService

BookingService

PaymentService

DashboardService

PartnerService

NotificationService
```

Semua proses utama dilakukan pada Service.

---

# 6.6 Repositories

Repository bertugas berkomunikasi langsung dengan database menggunakan Model.

```
app/Repositories/

HotelRepository

BookingRepository

RoomRepository

UserRepository
```

Repository bertanggung jawab terhadap query database.

---

# 6.7 Models

Model merepresentasikan setiap tabel pada database.

```
Users

Hotels

RoomTypes

Facilities

Bookings

BookingRooms

Guests

Payments

Reviews

Notifications

Warnings

PartnerApplications

PartnerDocuments

RoomAvailabilities

RoomPriceHistories
```

---

# 6.8 Requests

Folder Request digunakan untuk validasi input.

```
StoreHotelRequest

UpdateHotelRequest

StoreRoomRequest

StoreBookingRequest

StoreReviewRequest

StorePartnerRequest
```

Seluruh validasi ditempatkan di sini.

---

# 6.9 Resources

Digunakan untuk membentuk response JSON.

```
HotelResource

RoomResource

BookingResource

PaymentResource

ReviewResource
```

---

# 6.10 Database

```
database/

factories/

migrations/

seeders/
```

Migration bertugas membuat struktur tabel.

Seeder digunakan mengisi data awal.

Factory digunakan membuat dummy data.

---

# 6.11 Routes

```
routes/

api.php

web.php
```

Semua endpoint REST API ditulis pada `api.php`.

---

# 6.12 Storage

Digunakan untuk menyimpan file upload.

```
storage/

hotel/

room/

avatar/

invoice/

ticket/
```

---

# 6.13 Tests

Digunakan untuk pengujian.

```
Feature/

Unit/
```

---

# 6.14 Frontend Structure

Frontend dibangun menggunakan React dan Vite.

```
frontend/
│
├── public/
│
├── src/
│
├── assets/
│
├── components/
│
├── pages/
│
├── layouts/
│
├── routes/
│
├── hooks/
│
├── services/
│
├── context/
│
├── utils/
│
├── constants/
│
├── styles/
│
├── App.jsx
│
└── main.jsx
```

---

# 6.15 Components

Berisi komponen yang digunakan kembali.

Contoh:

```
Navbar

Sidebar

Footer

HotelCard

RoomCard

BookingCard

Rating

Modal

Button

Input
```

---

# 6.16 Pages

Berisi seluruh halaman.

```
Landing

Login

Register

Hotel

Hotel Detail

Booking

Payment

Profile

Dashboard User

Dashboard Admin Hotel

Dashboard Super Admin

Partner Registration

404
```

---

# 6.17 Layouts

Digunakan untuk layout.

```
GuestLayout

UserLayout

AdminLayout

SuperAdminLayout
```

---

# 6.18 Services

Berisi komunikasi dengan Backend API.

```
authService

hotelService

roomService

bookingService

paymentService

dashboardService

reviewService
```

---

# 6.19 Hooks

Berisi custom React Hook.

```
useAuth

useBooking

useHotel

usePayment

useNotification
```

---

# 6.20 Assets

Berisi seluruh aset.

```
images/

icons/

fonts/

logos/
```

---

# 6.21 Constants

Berisi konstanta aplikasi.

```
roles.js

status.js

routes.js

colors.js
```

---

# 6.22 Utils

Berisi helper.

```
currency.js

date.js

validator.js

formatter.js
```

---

# 6.23 Recommended Development Order

Urutan pengembangan yang disarankan adalah:

### Backend

1. Migration
2. Model
3. Seeder
4. Factory
5. Relationship
6. Request Validation
7. Service
8. Repository
9. Controller
10. API Resource
11. Testing

---

### Frontend

1. Routing
2. Layout
3. Component
4. Page
5. Service API
6. State Management
7. API Integration
8. Testing
9. Responsive Design

---

# 6.24 Coding Principles

Seluruh tim wajib mengikuti prinsip berikut:

- Satu controller menangani satu modul.
- Business logic ditempatkan pada Service.
- Query database ditempatkan pada Repository.
- Validasi menggunakan Form Request.
- Response API menggunakan Resource.
- Penamaan file menggunakan PascalCase untuk class dan camelCase untuk fungsi.
- Setiap fitur baru harus disertai dokumentasi dan pengujian sebelum di-merge.

# 7. User Roles & Permissions

## 7.1 Overview

H'Leven merupakan platform hotel booking yang memiliki empat jenis pengguna (roles). Setiap role memiliki hak akses, tanggung jawab, dan batasan yang berbeda sesuai dengan kebutuhan sistem.

Pembagian hak akses bertujuan untuk:

- Menjaga keamanan sistem.
- Membatasi akses terhadap data tertentu.
- Mempermudah pengelolaan fitur.
- Memastikan setiap pengguna hanya dapat mengakses modul yang sesuai.

Role yang tersedia pada sistem terdiri dari:

- Guest
- User
- Admin Hotel
- Super Admin

---

# 7.2 Guest

## Description

Guest merupakan pengunjung yang belum memiliki akun atau belum melakukan login ke dalam sistem.

Guest dapat melihat informasi hotel, tetapi tidak memiliki akses terhadap fitur yang membutuhkan autentikasi.

---

## Permissions

Guest dapat:

- Melihat Landing Page.
- Mencari hotel.
- Melihat daftar hotel.
- Melihat detail hotel.
- Melihat daftar kamar.
- Melihat fasilitas hotel.
- Melihat fasilitas kamar.
- Melihat ulasan hotel.
- Melihat lokasi hotel pada peta.
- Melakukan registrasi akun.
- Login ke sistem.

---

## Restrictions

Guest tidak dapat:

- Melakukan booking.
- Memberikan review.
- Melihat riwayat booking.
- Mengakses dashboard.
- Mengelola hotel.
- Mengakses halaman admin.

---

# 7.3 User

## Description

User merupakan pelanggan yang telah memiliki akun dan berhasil melakukan login ke dalam sistem.

User memiliki akses penuh terhadap proses pemesanan hotel.

---

## Permissions

User dapat:

### Account

- Login
- Logout
- Mengubah profil
- Mengubah password

### Hotel

- Mencari hotel.
- Filter hotel.
- Melihat detail hotel.
- Melihat lokasi hotel.

### Booking

- Memesan hotel.
- Mengisi data tamu.
- Melihat detail booking.
- Membatalkan booking (sesuai aturan).
- Melihat riwayat booking.

### Payment

- Melakukan pembayaran melalui Midtrans.
- Melihat status pembayaran.

### Review

- Memberikan review setelah checkout.
- Melihat review milik sendiri.

---

## Restrictions

User tidak dapat:

- Mengubah data hotel.
- Mengubah data kamar.
- Mengakses dashboard Admin Hotel.
- Mengakses dashboard Super Admin.
- Menyetujui partner hotel.

---

# 7.4 Admin Hotel

## Description

Admin Hotel merupakan pengguna yang bertanggung jawab mengelola satu hotel yang telah disetujui oleh Super Admin.

Admin Hotel hanya dapat mengakses data milik hotel yang dikelolanya.

---

## Permissions

### Dashboard

- Melihat Dashboard Admin Hotel.

---

### Hotel

- Mengubah informasi hotel.
- Mengelola foto hotel.

---

### Room

- Menambah kamar.
- Mengubah kamar.
- Menghapus kamar.
- Mengelola foto kamar.
- Mengatur harga kamar.
- Mengatur kapasitas kamar.
- Mengatur stok kamar.

---

### Facility

- Menambahkan fasilitas hotel.
- Menghapus fasilitas hotel.
- Menambahkan fasilitas kamar.
- Menghapus fasilitas kamar.

---

### Booking

- Melihat daftar booking.
- Melihat detail booking.
- Check In tamu.
- Check Out tamu.

---

### Review

- Melihat review hotel.
- Melihat rating hotel.

---

## Restrictions

Admin Hotel tidak dapat:

- Mengakses hotel lain.
- Menghapus akun pengguna.
- Mengelola Super Admin.
- Menyetujui partner hotel.
- Mengubah konfigurasi sistem.

---

# 7.5 Super Admin

## Description

Super Admin merupakan administrator tertinggi pada sistem H'Leven.

Super Admin bertanggung jawab terhadap seluruh pengelolaan platform.

---

## Permissions

### Dashboard

- Melihat Dashboard Super Admin.

---

### User Management

- Melihat seluruh user.
- Mengubah status user.
- Menonaktifkan user.

---

### Admin Hotel Management

- Menambah Admin Hotel.
- Mengubah Admin Hotel.
- Menghapus Admin Hotel.
- Menonaktifkan Admin Hotel.

---

### Hotel Management

- Melihat seluruh hotel.
- Menyetujui hotel.
- Menolak hotel.
- Menonaktifkan hotel.
- Mengaktifkan kembali hotel.

---

### Partner Management

- Melihat pengajuan partner.
- Approve partner.
- Reject partner.

---

### Warning Management

- Membuat warning.
- Mengubah warning.
- Menghapus warning.

---

### Notification

- Mengirim notifikasi kepada Admin Hotel.
- Mengirim notifikasi kepada User.

---

### Activity Log

- Melihat seluruh aktivitas sistem.

---

### Monitoring

- Melihat statistik sistem.
- Melihat jumlah booking.
- Melihat pendapatan.
- Melihat jumlah hotel.
- Melihat jumlah pengguna.

---

## Restrictions

Super Admin tidak mengelola operasional hotel secara langsung, seperti:

- Check In tamu.
- Check Out tamu.
- Mengubah harga kamar.
- Mengelola stok kamar.

Aktivitas tersebut merupakan tanggung jawab Admin Hotel.

---

# 7.6 Permission Matrix

| Feature | Guest | User | Admin Hotel | Super Admin |
|----------|:-----:|:----:|:-----------:|:-----------:|
| View Landing Page | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| Search Hotel | ✅ | ✅ | ✅ | ✅ |
| View Hotel Detail | ✅ | ✅ | ✅ | ✅ |
| Booking Hotel | ❌ | ✅ | ❌ | ❌ |
| Payment | ❌ | ✅ | ❌ | ❌ |
| Review Hotel | ❌ | ✅ | ❌ | ❌ |
| Dashboard User | ❌ | ✅ | ❌ | ❌ |
| Dashboard Admin Hotel | ❌ | ❌ | ✅ | ❌ |
| Dashboard Super Admin | ❌ | ❌ | ❌ | ✅ |
| CRUD Hotel | ❌ | ❌ | ✅ | ✅ *(Monitoring)* |
| CRUD Room | ❌ | ❌ | ✅ | ❌ |
| CRUD Facility | ❌ | ❌ | ✅ | ❌ |
| Manage Booking | ❌ | View Own | ✅ | View All |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Approve Hotel | ❌ | ❌ | ❌ | ✅ |
| Warning Management | ❌ | ❌ | ❌ | ✅ |
| Notification Management | ❌ | ❌ | ❌ | ✅ |
| Activity Log | ❌ | ❌ | ❌ | ✅ |

---

# 7.7 Access Control Rules

Untuk menjaga keamanan sistem, diterapkan aturan berikut:

1. Seluruh endpoint yang memerlukan autentikasi harus menggunakan Laravel Sanctum.
2. Setiap role hanya dapat mengakses endpoint sesuai dengan hak aksesnya.
3. Admin Hotel hanya dapat mengelola data hotel yang dimilikinya.
4. User hanya dapat melihat dan mengelola data booking miliknya sendiri.
5. Super Admin memiliki akses penuh terhadap data sistem, namun tidak melakukan operasional hotel sehari-hari.
6. Setiap aktivitas penting akan dicatat pada Activity Log untuk kebutuhan audit.

# 8. Functional Requirements

## 8.1 Overview

Functional Requirements menjelaskan seluruh fungsi yang harus disediakan oleh sistem H'Leven berdasarkan kebutuhan pengguna dan tujuan bisnis aplikasi.

Setiap fitur dijelaskan secara rinci meliputi:

- Tujuan fitur
- Aktor yang menggunakan
- Prasyarat
- Alur utama
- Hasil akhir
- Business Rules

Seluruh implementasi Backend maupun Frontend harus mengacu pada bagian ini.

---

# 8.2 Authentication Module

## Description

Authentication merupakan modul yang digunakan untuk melakukan proses autentikasi pengguna sebelum mengakses fitur yang memerlukan hak akses tertentu.

Sistem menggunakan autentikasi berbasis email dan password.

Pada versi pertama (Checkpoint 1), fitur Google OAuth, Email OTP, dan Email Verification belum diimplementasikan.

---

## Actors

- Guest
- User
- Admin Hotel
- Super Admin

---

## Features

### Register

Deskripsi

Guest dapat membuat akun baru menggunakan email.

Input

- Nama
- Email
- Password
- Konfirmasi Password

Output

- Akun berhasil dibuat.

Business Rules

- Email harus unik.
- Password minimal 8 karakter.
- Password dan konfirmasi password harus sama.

---

### Login

Deskripsi

Pengguna dapat masuk ke sistem menggunakan email dan password.

Input

- Email
- Password

Output

- Login berhasil.
- Token autentikasi dibuat.

Business Rules

- Email harus terdaftar.
- Password harus sesuai.
- Akun yang diblokir tidak dapat login.

---

### Logout

Deskripsi

Menghapus token autentikasi pengguna.

Output

- Logout berhasil.

---

### Update Profile

Deskripsi

User dapat mengubah informasi profil.

Data yang dapat diubah

- Nama
- Nomor Telepon
- Foto Profil

---

### Change Password

Deskripsi

Mengubah password akun.

Business Rules

- Password lama harus benar.
- Password baru minimal 8 karakter.

# 8.3 Hotel Module

## Description

Modul Hotel digunakan untuk mengelola seluruh informasi hotel yang tersedia pada sistem.

Hotel hanya dapat dikelola oleh Admin Hotel yang bersangkutan.

---

## Actors

- Guest
- User
- Admin Hotel
- Super Admin

---

## Features

### Search Hotel

Pengguna dapat mencari hotel berdasarkan:

- Nama Hotel
- Kota
- Lokasi

---

### Filter Hotel

Pengguna dapat memfilter hotel berdasarkan:

- Harga
- Rating
- Fasilitas
- Kapasitas
- Breakfast
- Smoking Area

---

### View Hotel Detail

Menampilkan

- Nama Hotel
- Foto
- Deskripsi
- Lokasi
- Rating
- Review
- Daftar Kamar

---

### CRUD Hotel

Hanya Admin Hotel.

Fitur

- Tambah Hotel
- Edit Hotel
- Hapus Hotel

---

### Upload Hotel Photo

Admin Hotel dapat menambahkan beberapa foto hotel.

Business Rules

- Format JPG PNG WEBP
- Maksimal ukuran 5 MB
- Minimal satu foto

---

### Maps

Menampilkan lokasi hotel menggunakan OpenStreetMap.

Pengguna dapat membuka navigasi menuju hotel.

Future Development

Pengguna dapat mencari hotel terdekat berdasarkan lokasi saat ini.

# 8.4 Room Module

## Description

Room merupakan modul yang mengelola seluruh jenis kamar yang dimiliki hotel.

---

## Actors

- Admin Hotel
- User
- Guest

---

## Features

### CRUD Room

Admin Hotel dapat

- Tambah Room
- Edit Room
- Hapus Room

---

### Room Detail

Menampilkan

- Nama
- Deskripsi
- Harga Weekday
- Harga Weekend
- Kapasitas
- Breakfast
- Smoking Area
- Fasilitas
- Foto

---

### Upload Room Photo

Admin Hotel dapat mengunggah beberapa foto.

Business Rules

Minimal satu foto.

---

### Room Availability

Menampilkan stok kamar sesuai tanggal booking.

---

### Room Price

Harga dibedakan menjadi

- Weekday
- Weekend

Harga dihitung otomatis berdasarkan tanggal check-in dan check-out.

---

### Room Price History

Menyimpan riwayat perubahan harga.

Digunakan untuk audit dan pelacakan perubahan harga.


# 8.5 Booking Module

## Description

Booking merupakan fitur utama H'Leven yang memungkinkan User melakukan reservasi kamar hotel.

---

## Actors

- User

---

## Features

### Create Booking

Input

- Hotel
- Room
- Check In
- Check Out
- Jumlah Kamar
- Data Tamu

Output

Booking berhasil dibuat.

---

### Booking Detail

Menampilkan

- Booking Code
- Hotel
- Room
- Harga
- Pajak
- Total
- Status

---

### Booking History

Menampilkan seluruh riwayat booking.

---

### Cancel Booking

User dapat membatalkan booking sebelum pembayaran selesai atau sesuai kebijakan hotel.

---

### Guest Information

User dapat mengisi data tamu.

Data

- Nama
- Nomor Identitas
- Nomor Telepon
- Jenis Kelamin

---

### Booking Status

Status terdiri dari

- Pending
- Unpaid
- Paid
- Checked In
- Checked Out
- Cancelled
- Expired

---

### Business Rules

- Check Out harus setelah Check In.
- Minimal menginap satu malam.
- Tidak dapat memesan kamar yang stoknya habis.
- Booking yang belum dibayar akan kedaluwarsa sesuai batas waktu pembayaran.

# 8.6 Payment Module

## Description

Pembayaran dilakukan menggunakan Midtrans.

---

## Actors

- User

---

## Features

### Payment

Melakukan pembayaran menggunakan Midtrans.

---

### Callback

Midtrans mengirim status pembayaran ke sistem.

---

### Payment Status

Status pembayaran

- Pending
- Success
- Failed
- Expired
- Cancelled

---

### QR Code

Setelah pembayaran berhasil, sistem menghasilkan QR Code yang digunakan saat proses check-in.

---

### Business Rules

- Satu booking hanya memiliki satu transaksi pembayaran.
- QR Code hanya dibuat setelah pembayaran berhasil.

# 8.7 Review Module

## Description

User dapat memberikan penilaian terhadap hotel setelah menyelesaikan masa menginap.

---

## Features

- Memberikan Rating
- Memberikan Komentar
- Melihat Review

---

## Business Rules

- Review hanya dapat dibuat setelah status booking menjadi Checked Out.
- Satu booking hanya dapat memberikan satu review.
- Rating menggunakan skala 1 sampai 5.

# 8.8 Dashboard Module

## Dashboard User

Menampilkan

- Booking Aktif
- Booking Selesai
- Riwayat Booking

---

## Dashboard Admin Hotel

Menampilkan

- Total Booking
- Pendapatan
- Occupancy Rate
- Rating Hotel
- Booking Hari Ini

---

## Dashboard Super Admin

Menampilkan

- Total User
- Total Hotel
- Total Booking
- Total Pendapatan
- Hotel Pending
- Grafik Statistik

# 8.9 Notification Module

## Description

Notification digunakan untuk memberikan informasi kepada pengguna mengenai aktivitas yang terjadi di dalam sistem.

Contoh:

- Booking berhasil dibuat.
- Pembayaran berhasil.
- Hotel disetujui.
- Hotel ditolak.
- Warning baru.

Notification ditampilkan di dalam aplikasi (In-App Notification).

# 8.10 Partner Module

## Description

Calon mitra hotel dapat mengajukan pendaftaran hotel melalui sistem.

---

## Features

- Mengisi data pemilik.
- Mengisi data hotel.
- Mengunggah dokumen pendukung.

---

## Super Admin

Super Admin dapat:

- Melihat pengajuan.
- Menyetujui pengajuan.
- Menolak pengajuan.

---

## Business Rules

- Pengajuan harus diverifikasi sebelum hotel dapat dikelola.
- Pengajuan yang ditolak tidak dapat digunakan sampai dilakukan pengajuan ulang.

# 9. Business Rules

## 9.1 Overview

Business Rules merupakan kumpulan aturan bisnis yang menjadi dasar seluruh proses pada sistem H'Leven.

Seluruh proses pada Backend, Frontend, Database, maupun API wajib mengikuti aturan yang telah ditetapkan pada dokumen ini.

Business Rules bertujuan untuk:

- Menjaga konsistensi data.
- Menjaga keamanan sistem.
- Menghindari kesalahan proses bisnis.
- Menjadi acuan utama selama pengembangan.

---

# 9.2 Authentication Rules

### BR-001

Email pengguna harus unik.

---

### BR-002

Password minimal terdiri dari 8 karakter.

---

### BR-003

Pengguna yang berstatus **Blocked** tidak dapat login.

---

### BR-004

Setiap akun memiliki satu role utama.

Role yang tersedia:

- User
- Admin Hotel
- Super Admin

---

### BR-005

Setelah login berhasil, sistem akan membuat token autentikasi menggunakan Laravel Sanctum.

---

# 9.3 Hotel Rules

### BR-006

Setiap hotel hanya dimiliki oleh satu Admin Hotel.

---

### BR-007

Admin Hotel hanya dapat mengelola hotel miliknya sendiri.

---

### BR-008

Hotel wajib memiliki minimal satu foto.

---

### BR-009

Hotel wajib memiliki minimal satu tipe kamar sebelum dapat menerima booking.

---

### BR-010

Hotel dapat memiliki banyak fasilitas.

---

### BR-011

Lokasi hotel wajib memiliki koordinat Latitude dan Longitude agar dapat ditampilkan pada OpenStreetMap.

---

# 9.4 Room Rules

### BR-012

Setiap Room hanya dimiliki oleh satu Hotel.

---

### BR-013

Room wajib memiliki:

- Nama
- Harga Weekday
- Harga Weekend
- Kapasitas
- Stok

---

### BR-014

Room wajib memiliki minimal satu foto.

---

### BR-015

Room dapat memiliki banyak fasilitas.

---

### BR-016

Harga Weekday dan Weekend harus bernilai lebih dari nol.

---

### BR-017

Stok kamar tidak boleh bernilai negatif.

---

### BR-018

Perubahan harga kamar harus dicatat pada tabel `room_price_histories`.

---

# 9.5 Booking Rules

### BR-019

User harus login sebelum melakukan booking.

---

### BR-020

Booking minimal dilakukan untuk satu malam.

---

### BR-021

Tanggal Check Out harus lebih besar daripada Check In.

---

### BR-022

Jumlah kamar yang dipesan tidak boleh melebihi stok yang tersedia.

---

### BR-023

Booking hanya dapat dilakukan apabila stok kamar masih tersedia.

---

### BR-024

Satu booking hanya dapat dibuat oleh satu User.

---

### BR-025

Satu booking dapat memiliki lebih dari satu tamu.

---

### BR-026

Booking akan menghasilkan Booking Code yang unik.

---

### BR-027

Setelah booking berhasil dibuat, status awal booking adalah:

Pending

---

### BR-028

Booking yang tidak dibayar sebelum batas waktu pembayaran akan berubah menjadi:

Expired

---

### BR-029

Booking yang sudah dibayar tidak dapat diubah.

---

### BR-030

Booking yang telah selesai akan memiliki status:

Checked Out

---

# 9.6 Guest Rules

### BR-031

Minimal terdapat satu data tamu pada setiap booking.

---

### BR-032

Data tamu dapat berbeda dengan pemilik akun.

---

### BR-033

Nomor identitas tamu tidak boleh kosong.

---

# 9.7 Payment Rules

### BR-034

Pembayaran dilakukan menggunakan Midtrans.

---

### BR-035

Satu booking hanya memiliki satu transaksi pembayaran.

---

### BR-036

Status pembayaran hanya dapat berubah berdasarkan callback Midtrans.

---

### BR-037

QR Code hanya dibuat apabila pembayaran berhasil.

---

### BR-038

Status pembayaran yang tersedia:

- Pending
- Success
- Failed
- Expired
- Cancelled

---

### BR-039

Apabila pembayaran berhasil maka status booking berubah menjadi:

Paid

---

### BR-040

Apabila pembayaran gagal maka booking tetap berstatus:

Pending

---

# 9.8 Check In & Check Out Rules

### BR-041

Admin Hotel melakukan proses Check In menggunakan QR Code.

---

### BR-042

QR Code hanya berlaku untuk satu booking.

---

### BR-043

QR Code tidak dapat digunakan dua kali.

---

### BR-044

Status booking berubah menjadi Checked In setelah QR Code berhasil diverifikasi.

---

### BR-045

Admin Hotel melakukan proses Check Out setelah tamu selesai menginap.

---

# 9.9 Review Rules

### BR-046

Review hanya dapat dibuat setelah status booking menjadi Checked Out.

---

### BR-047

Satu booking hanya dapat memiliki satu review.

---

### BR-048

Rating menggunakan skala:

1 - 5

---

### BR-049

Nilai rata-rata rating hotel dihitung secara otomatis.

---

# 9.10 Notification Rules

### BR-050

Setiap aktivitas penting akan menghasilkan notifikasi.

Contoh:

- Booking berhasil.
- Pembayaran berhasil.
- Hotel disetujui.
- Warning baru.

---

### BR-051

Notification hanya dapat dibaca oleh penerima.

---

# 9.11 Warning Rules

### BR-052

Warning hanya dapat dibuat oleh Super Admin.

---

### BR-053

Warning hanya dapat ditujukan kepada Admin Hotel.

---

### BR-054

Warning memiliki status:

- Unread
- Read
- Closed

---

# 9.12 Partner Rules

### BR-055

Calon mitra harus mengisi seluruh data yang dibutuhkan.

---

### BR-056

Super Admin berhak menyetujui atau menolak pengajuan.

---

### BR-057

Hotel baru dapat digunakan setelah pengajuan disetujui.

---

# 9.13 Dashboard Rules

### BR-058

Dashboard hanya dapat diakses sesuai role pengguna.

---

### BR-059

Admin Hotel hanya melihat data milik hotelnya.

---

### BR-060

Super Admin dapat melihat seluruh data sistem.

---

# 9.14 Room Availability Rules

### BR-061

Stok kamar dihitung berdasarkan tanggal menginap.

---

### BR-062

Ketika booking berhasil dibuat, sistem mengurangi stok pada seluruh tanggal menginap.

---

### BR-063

Ketika booking dibatalkan atau pembayaran kedaluwarsa, stok kamar dikembalikan.

---

### BR-064

Room Availability digunakan sebagai acuan utama saat pencarian kamar.

---

# 9.15 Price Calculation Rules

### BR-065

Harga dihitung berdasarkan tanggal menginap.

---

### BR-066

Hari Senin sampai Jumat menggunakan harga Weekday.

---

### BR-067

Hari Sabtu dan Minggu menggunakan harga Weekend.

---

### BR-068

Apabila periode menginap mencakup weekday dan weekend, sistem menghitung harga setiap malam secara terpisah.

Contoh:

Check In : Jumat

Check Out : Senin

Perhitungan:

Jumat = Weekday

Sabtu = Weekend

Minggu = Weekend

Total = Jumat + Sabtu + Minggu

---

### BR-069

Harga yang digunakan pada saat booking disimpan sebagai histori dan tidak berubah meskipun harga kamar diubah setelah booking selesai dibuat.

---

# 9.16 Maps Rules

### BR-070

Seluruh hotel harus memiliki koordinat lokasi.

---

### BR-071

Lokasi hotel ditampilkan menggunakan OpenStreetMap.

---

### BR-072

Pengguna dapat melihat lokasi hotel sebelum melakukan booking.

---

### BR-073

Pada pengembangan berikutnya, sistem dapat menampilkan rekomendasi hotel terdekat berdasarkan lokasi pengguna.

---

# 9.17 Audit Rules

### BR-074

Seluruh aktivitas penting dicatat pada Activity Log.

---

### BR-075

Activity Log tidak dapat diubah oleh pengguna biasa.

---

### BR-076

Activity Log hanya dapat diakses oleh Super Admin.

---

# 9.18 Security Rules

### BR-077

Seluruh endpoint yang memerlukan autentikasi wajib menggunakan Laravel Sanctum.

---

### BR-078

Seluruh input wajib divalidasi sebelum diproses.

---

### BR-079

Pengguna hanya dapat mengakses data yang menjadi hak aksesnya.

---

### BR-080

Seluruh API harus mengembalikan response dalam format JSON yang konsisten.

# 10. Database Design

## 10.1 Overview

Database merupakan komponen utama dalam sistem H'Leven yang berfungsi untuk menyimpan seluruh data operasional aplikasi.

Sistem menggunakan **PostgreSQL** yang di-host pada **Supabase** sebagai Database Management System (DBMS). Seluruh tabel telah dirancang mengikuti prinsip **Third Normal Form (3NF)** untuk mengurangi redundansi data, menjaga konsistensi informasi, dan meningkatkan performa proses pengolahan data.

Database dirancang agar mampu mendukung seluruh proses bisnis H'Leven, mulai dari autentikasi pengguna, pengelolaan hotel, manajemen kamar, proses booking, pembayaran, hingga monitoring oleh Super Admin.

---

## 10.2 Database Objectives

Perancangan database memiliki tujuan sebagai berikut:

- Menyimpan data secara terstruktur.
- Mengurangi redundansi data.
- Menjaga integritas antar tabel.
- Mendukung proses transaksi booking.
- Mendukung pencarian hotel dan kamar.
- Mendukung proses pembayaran.
- Mendukung audit aktivitas sistem.
- Mempermudah proses pengembangan dan pemeliharaan sistem.

---

## 10.3 Database Management System

| Item | Value |
|------|-------|
| DBMS | PostgreSQL |
| Provider | Supabase |
| Database Type | Relational Database |
| Normalization | Third Normal Form (3NF) |
| Architecture | REST API |
| ORM | Laravel Eloquent |

---

## 10.4 Database Architecture

Database H'Leven dibagi menjadi beberapa kelompok modul berdasarkan fungsi bisnis.

### Authentication Module

Mengelola data pengguna serta proses autentikasi.

Tabel:

- users
- email_otps *(Future Development)*

---

### Hotel Module

Mengelola seluruh data hotel.

Tabel:

- hotels
- hotel_photos
- cities
- facilities
- hotel_facilities

---

### Room Module

Mengelola seluruh informasi kamar hotel.

Tabel:

- room_types
- room_photos
- room_facilities
- room_availabilities
- room_price_histories

---

### Booking Module

Mengelola proses reservasi hotel.

Tabel:

- bookings
- booking_rooms
- guests

---

### Payment Module

Mengelola proses pembayaran.

Tabel:

- payments
- e_tickets

---

### Review Module

Mengelola ulasan hotel.

Tabel:

- reviews

---

### Super Admin Module

Mengelola seluruh aktivitas administrator.

Tabel:

- warnings
- notifications
- activity_logs
- partner_applications
- partner_documents

---

## 10.5 Database Normalization

Database H'Leven telah dirancang menggunakan Third Normal Form (3NF).

### First Normal Form (1NF)

Seluruh tabel memiliki:

- Primary Key.
- Nilai atribut bersifat atomik.
- Tidak terdapat kelompok data berulang.

---

### Second Normal Form (2NF)

Seluruh atribut non-key bergantung sepenuhnya pada Primary Key.

Tidak terdapat partial dependency.

---

### Third Normal Form (3NF)

Tidak terdapat ketergantungan transitif.

Data dipisahkan menjadi tabel-tabel terpisah sehingga tidak terjadi redundansi.

Contoh:

Informasi kota dipindahkan ke tabel `cities`.

Informasi fasilitas dipisahkan ke tabel `facilities`.

Riwayat perubahan harga disimpan pada tabel `room_price_histories`.

Ketersediaan kamar disimpan pada tabel `room_availabilities`.

---

## 10.6 Relationship Overview

Relasi utama pada database terdiri dari:

### One to One (1:1)

- Booking → Payment
- Booking → Review
- Booking → E-Ticket

---

### One to Many (1:N)

- User → Hotel
- City → Hotel
- Hotel → Room
- Hotel → Booking
- Hotel → Review
- Booking → Guest
- Booking → Booking Room
- Room → Room Photo
- Room → Room Availability
- Room → Room Price History

---

### Many to Many (N:M)

Relasi Many-to-Many direpresentasikan menggunakan tabel pivot.

Hotel ↔ Facility

Pivot:

- hotel_facilities

Room ↔ Facility

Pivot:

- room_facilities

---

## 10.7 Entity Summary

Database H'Leven terdiri dari **21 tabel utama**.

| Modul | Jumlah Tabel |
|---------|-------------:|
| Authentication | 2 |
| Hotel | 5 |
| Room | 5 |
| Booking | 3 |
| Payment | 2 |
| Review | 1 |
| Monitoring | 5 |

Total keseluruhan:

**23 tabel** *(disesuaikan dengan ERD final yang digunakan).*

---

## 10.8 Database Diagram

Diagram Entity Relationship Diagram (ERD) menggambarkan hubungan antar tabel pada database H'Leven.

Diagram ERD disusun menggunakan notasi Crow's Foot dan menjadi acuan utama selama proses implementasi database.

> **Catatan:** Sisipkan gambar ERD final atau hasil ekspor Draw.io pada bagian ini.

---

## 10.9 Database Design Principles

Seluruh implementasi database harus mengikuti prinsip berikut:

1. Setiap tabel wajib memiliki Primary Key.
2. Seluruh relasi menggunakan Foreign Key.
3. Hindari penyimpanan data yang bersifat redundan.
4. Gunakan tabel pivot untuk relasi Many-to-Many.
5. Gunakan tipe data yang sesuai dengan kebutuhan.
6. Simpan histori perubahan data apabila diperlukan (misalnya perubahan harga kamar).
7. Seluruh transaksi booking harus menjaga konsistensi data menggunakan database transaction.
8. Seluruh kolom `created_at` dan `updated_at` dikelola secara otomatis oleh Laravel.

---

## 10.10 Database Naming Convention

Penamaan tabel dan kolom mengikuti standar Laravel.

### Tabel

Menggunakan bentuk jamak (plural).

Contoh:

- users
- hotels
- bookings

---

### Primary Key

Menggunakan nama:

```text
id
```

---

### Foreign Key

Menggunakan format:

```text
nama_tabel_id
```

Contoh:

```text
user_id

hotel_id

booking_id

room_type_id
```

---

### Timestamp

Seluruh tabel utama menggunakan:

```text
created_at

updated_at
```

---

### Soft Delete

Apabila diperlukan pada pengembangan berikutnya, tabel tertentu dapat menggunakan:

```text
deleted_at
```

untuk mendukung fitur Soft Delete Laravel.

# 11.1 Table Documentation

# Table : users

## Overview

Tabel `users` merupakan tabel utama yang menyimpan seluruh data akun pengguna dalam sistem H'Leven.

Seluruh role pada sistem disimpan pada tabel ini, termasuk User, Admin Hotel, dan Super Admin.

Tabel ini menjadi pusat autentikasi dan otorisasi seluruh aplikasi.

---

## Purpose

Tabel ini digunakan untuk:

- Login
- Authentication
- Authorization
- Profile
- Relasi dengan Booking
- Relasi dengan Review
- Relasi dengan Hotel
- Relasi dengan Notification
- Relasi dengan Activity Log

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| role | enum | No | Role pengguna |
| name | varchar | No | Nama pengguna |
| email | varchar | No | Email |
| password | varchar | No | Password terenkripsi |
| phone | varchar | Yes | Nomor telepon |
| avatar | varchar | Yes | Foto profil |
| google_id | varchar | Yes | Future Development |
| email_verified_at | timestamp | Yes | Future Development |
| status | enum | No | Status akun |
| remember_token | varchar | Yes | Laravel Remember Token |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

```

id

```

---

## Foreign Key

Tidak memiliki Foreign Key.

---

## Relationships

users

↓

hotels

(1:N)

---

users

↓

bookings

(1:N)

---

users

↓

reviews

(1:N)

---

users

↓

notifications

(1:N)

---

users

↓

activity_logs

(1:N)

---

users

↓

warnings

(1:N)

---

## Business Rules

- Email harus unik.
- Password wajib dienkripsi menggunakan bcrypt.
- Setiap akun memiliki satu role.
- Akun berstatus Blocked tidak dapat login.

---

## Example Data

| id | role | name |
|----|------|------|
| 1 | super_admin | Administrator |
| 2 | admin_hotel | Hotel Bandung |
| 3 | user | Budi |

---

## Laravel Notes

Model

```

User.php

```

Factory

```

UserFactory.php

```

Seeder

```

UserSeeder.php

```

Migration

```

create_users_table.php

```

# Table : cities

## Overview

Tabel `cities` menyimpan daftar kota beserta provinsi yang digunakan sebagai lokasi hotel.

Data kota dipisahkan dari tabel hotel untuk menghindari redundansi data.

---

## Purpose

Digunakan sebagai referensi lokasi hotel.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| province | varchar | No | Nama provinsi |
| city | varchar | No | Nama kota |

---

## Primary Key

id

---

## Foreign Key

Tidak ada.

---

## Relationships

cities

↓

hotels

(1:N)

---

## Business Rules

- Nama kota tidak boleh kosong.
- Kota dapat digunakan oleh banyak hotel.

---

## Example Data

| id | Province | City |
|----|----------|------|
|1|Jawa Barat|Bandung|
|2|DKI Jakarta|Jakarta|

---

## Laravel Notes

Model

City.php

Migration

create_cities_table.php

Seeder

CitySeeder.php

# Table : hotels

## Overview

Tabel `hotels` menyimpan seluruh informasi utama mengenai hotel yang tersedia pada platform H'Leven.

Setiap hotel dikelola oleh satu Admin Hotel dan berada pada satu kota.

---

## Purpose

Digunakan untuk:

- Menampilkan daftar hotel.
- Menampilkan detail hotel.
- Menjadi induk bagi data kamar.
- Menjadi induk bagi booking.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| admin_id | bigint | No | Admin Hotel |
| city_id | bigint | No | Kota |
| name | varchar | No | Nama Hotel |
| slug | varchar | No | URL Slug |
| description | text | Yes | Deskripsi |
| address | text | No | Alamat |
| average_rating | decimal | No | Rating rata-rata |
| total_review | integer | No | Jumlah review |
| latitude | decimal | Yes | Latitude |
| longitude | decimal | Yes | Longitude |
| status | enum | No | Status hotel |
| created_at | timestamp | No | Dibuat |
| updated_at | timestamp | No | Diperbarui |

---

## Primary Key

id

---

## Foreign Key

admin_id → users.id

city_id → cities.id

---

## Relationships

users

↓

hotels

(1:N)

cities

↓

hotels

(1:N)

hotels

↓

room_types

(1:N)

hotels

↓

bookings

(1:N)

hotels

↓

reviews

(1:N)

hotels

↓

hotel_photos

(1:N)

hotels

↓

hotel_facilities

(1:N)

hotels

↓

warnings

(1:N)

---

## Business Rules

- Hotel harus dimiliki satu Admin Hotel.
- Hotel harus memiliki minimal satu kamar.
- Hotel harus memiliki minimal satu foto.
- Lokasi hotel menggunakan koordinat Latitude dan Longitude.
- Hotel yang dinonaktifkan tidak dapat menerima booking baru.

---

## Example Data

| id | Hotel | City |
|----|-------|------|
|1|Grand Asia Hotel|Bandung|
|2|Sky Hotel|Jakarta|

---

## Laravel Notes

Model

Hotel.php

Migration

create_hotels_table.php

Factory

HotelFactory.php

Seeder

HotelSeeder.php

# 11.2 Hotel Module

Modul Hotel bertanggung jawab dalam menyimpan seluruh informasi mengenai hotel, lokasi, fasilitas, dan media yang berkaitan dengan hotel.

Modul ini terdiri dari lima tabel utama:

- hotels
- hotel_photos
- facilities
- hotel_facilities
- cities

---

# Table : hotel_photos

## Overview

Tabel `hotel_photos` digunakan untuk menyimpan seluruh foto yang dimiliki oleh sebuah hotel.

Satu hotel dapat memiliki banyak foto sehingga gambar ditampilkan dalam bentuk galeri pada halaman detail hotel.

---

## Purpose

Digunakan untuk:

- Menampilkan galeri hotel.
- Menyimpan foto utama hotel.
- Dokumentasi visual hotel.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| hotel_id | bigint | No | Foreign Key ke hotels |
| photo | varchar | No | Path gambar |
| is_thumbnail | boolean | No | Penanda foto utama |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

id

---

## Foreign Key

hotel_id → hotels.id

---

## Relationships

hotels

↓

hotel_photos

(1:N)

---

## Business Rules

- Setiap hotel minimal memiliki satu foto.
- Maksimal ukuran file mengikuti konfigurasi sistem.
- Format yang diperbolehkan:
  - JPG
  - JPEG
  - PNG
  - WEBP
- Hanya satu foto yang boleh menjadi thumbnail (`is_thumbnail = true`).

---

## Example Data

| id | hotel_id | photo | is_thumbnail |
|----|----------|-------|--------------|
|1|1|hotel1.jpg|true|
|2|1|hotel2.jpg|false|

---

## Laravel Notes

Model

HotelPhoto.php

Migration

create_hotel_photos_table.php

---

# Table : facilities

## Overview

Tabel `facilities` merupakan master data fasilitas yang dapat digunakan baik oleh hotel maupun kamar.

Data fasilitas hanya dibuat satu kali sehingga menghindari duplikasi.

---

## Purpose

Digunakan sebagai master fasilitas.

Contoh:

- WiFi
- Kolam Renang
- AC
- Smart TV
- Shower
- Water Heater

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| name | varchar | No | Nama fasilitas |
| category | enum | No | Hotel / Room / Bathroom |

---

## Primary Key

id

---

## Foreign Key

Tidak ada.

---

## Relationships

facilities

↓

hotel_facilities

(N:M)

facilities

↓

room_facilities

(N:M)

---

## Business Rules

- Nama fasilitas harus unik.
- Fasilitas dapat digunakan oleh banyak hotel.
- Fasilitas dapat digunakan oleh banyak kamar.

---

## Example Data

| id | name | category |
|----|------|----------|
|1|WiFi|Hotel|
|2|AC|Room|
|3|Bathtub|Bathroom|

---

## Laravel Notes

Model

Facility.php

Migration

create_facilities_table.php

---

# Table : hotel_facilities

## Overview

Merupakan tabel pivot yang menghubungkan hotel dengan fasilitas.

Karena satu hotel memiliki banyak fasilitas dan satu fasilitas dapat dimiliki banyak hotel, maka hubungan yang digunakan adalah Many-to-Many.

---

## Purpose

Menghubungkan:

Hotel

↔

Facility

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| hotel_id | bigint | No | FK ke hotels |
| facility_id | bigint | No | FK ke facilities |

---

## Primary Key

Composite Primary Key

hotel_id

facility_id

---

## Foreign Key

hotel_id → hotels.id

facility_id → facilities.id

---

## Relationships

hotels

↓

hotel_facilities

facilities

↓

hotel_facilities

---

## Business Rules

- Kombinasi hotel dan fasilitas harus unik.
- Hotel dapat memiliki lebih dari satu fasilitas.
- Satu fasilitas dapat digunakan oleh banyak hotel.

---

## Example Data

| hotel_id | facility_id |
|----------|-------------|
|1|1|
|1|2|
|1|5|

---

## Laravel Notes

Tidak memerlukan Model apabila menggunakan belongsToMany().

Apabila membutuhkan atribut tambahan di masa depan, dapat dibuat Model `HotelFacility.php`.

---

# Hotel Module Relationships

```
cities
    │
    │ 1
    │
    ▼
hotels
    │
    ├──────────────┐
    │              │
    ▼              ▼
hotel_photos   room_types
    │
    │
    ▼
hotel_facilities
    ▲
    │
facilities
```

---

# Hotel Module Business Rules

### HM-001

Hotel wajib memiliki satu Admin Hotel.

---

### HM-002

Hotel wajib memiliki minimal satu kamar sebelum menerima booking.

---

### HM-003

Hotel wajib memiliki minimal satu foto.

---

### HM-004

Hotel dapat memiliki banyak fasilitas.

---

### HM-005

Nama hotel tidak harus unik, tetapi kombinasi nama dan alamat tidak boleh sama.

---

### HM-006

Slug hotel harus unik.

---

### HM-007

Status hotel terdiri dari:

- Active
- Inactive
- Blocked

Hotel dengan status selain **Active** tidak dapat menerima booking baru.

---

### HM-008

Average Rating dihitung otomatis berdasarkan seluruh review yang telah diverifikasi.

---

### HM-009

Total Review dihitung otomatis setiap kali review baru dibuat atau dihapus.

---

### HM-010

Lokasi hotel wajib memiliki Latitude dan Longitude agar dapat ditampilkan pada OpenStreetMap.

# 11.3 Room Module

## Overview

Room Module bertanggung jawab dalam mengelola seluruh data kamar yang dimiliki oleh setiap hotel.

Modul ini mencakup informasi jenis kamar, fasilitas kamar, galeri foto, ketersediaan kamar berdasarkan tanggal, serta riwayat perubahan harga.

Seluruh proses pencarian kamar, perhitungan harga, pengecekan stok, hingga proses booking menggunakan data dari modul ini.

---

## Tables

Room Module terdiri dari lima tabel utama:

- room_types
- room_photos
- room_facilities
- room_availabilities
- room_price_histories

---

# Table : room_types

## Overview

Tabel `room_types` menyimpan informasi utama mengenai jenis kamar yang dimiliki oleh setiap hotel.

Satu hotel dapat memiliki banyak jenis kamar, seperti:

- Standard Room
- Deluxe Room
- Superior Room
- Family Room
- Suite Room

Setiap jenis kamar memiliki harga, kapasitas, stok, dan fasilitas yang berbeda.

---

## Purpose

Digunakan untuk:

- Menampilkan daftar kamar.
- Menampilkan detail kamar.
- Menentukan harga kamar.
- Menentukan kapasitas kamar.
- Menjadi acuan proses booking.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| hotel_id | bigint | No | Hotel pemilik |
| name | varchar | No | Nama kamar |
| description | text | Yes | Deskripsi |
| weekday_price | decimal | No | Harga weekday |
| weekend_price | decimal | No | Harga weekend |
| stock | integer | No | Total stok |
| capacity_adult | integer | No | Kapasitas dewasa |
| capacity_child | integer | No | Kapasitas anak |
| breakfast | boolean | No | Termasuk sarapan |
| smoking_area | boolean | No | Area merokok |
| created_at | timestamp | No | Dibuat |
| updated_at | timestamp | No | Diubah |

---

## Primary Key

id

---

## Foreign Key

hotel_id → hotels.id

---

## Relationships

hotels

↓

room_types

(1:N)

room_types

↓

room_photos

(1:N)

room_types

↓

room_facilities

(1:N)

room_types

↓

room_availabilities

(1:N)

room_types

↓

room_price_histories

(1:N)

room_types

↓

booking_rooms

(1:N)

---

## Business Rules

- Setiap room wajib dimiliki satu hotel.
- Nama room boleh sama antar hotel.
- Harga weekday wajib lebih dari 0.
- Harga weekend wajib lebih dari 0.
- Kapasitas minimal satu orang.
- Stock minimal satu kamar.

---

## Example Data

| id | hotel_id | Room | Weekday | Weekend |
|----|----------|------|---------|----------|
|1|1|Deluxe|450000|550000|
|2|1|Suite|850000|950000|

---

## Laravel Notes

Model

RoomType.php

Migration

create_room_types_table.php

Factory

RoomTypeFactory.php

Seeder

RoomTypeSeeder.php

---

# Table : room_photos

## Overview

Tabel ini menyimpan seluruh foto yang dimiliki oleh suatu tipe kamar.

Setiap tipe kamar dapat memiliki lebih dari satu foto sehingga pengguna dapat melihat galeri kamar sebelum melakukan booking.

---

## Purpose

- Menampilkan galeri kamar.
- Menyimpan foto utama kamar.
- Dokumentasi visual kamar.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| room_type_id | bigint | No | FK Room |
| photo | varchar | No | Lokasi file |
| is_thumbnail | boolean | No | Foto utama |
| created_at | timestamp | No | Dibuat |
| updated_at | timestamp | No | Diubah |

---

## Primary Key

id

---

## Foreign Key

room_type_id → room_types.id

---

## Relationships

room_types

↓

room_photos

(1:N)

---

## Business Rules

- Minimal satu foto.
- Maksimal satu thumbnail.
- Format gambar mengikuti standar sistem.

---

# Table : room_facilities

## Overview

Merupakan tabel pivot yang menghubungkan room dengan fasilitas.

Hubungan:

Room

↔

Facility

---

## Table Structure

| Column | Type |
|---------|------|
| room_type_id | bigint |
| facility_id | bigint |

---

## Primary Key

Composite Key

room_type_id

facility_id

---

## Foreign Key

room_type_id → room_types.id

facility_id → facilities.id

---

## Relationships

room_types

↓

room_facilities

facilities

↓

room_facilities

---

## Business Rules

- Kombinasi room dan fasilitas harus unik.
- Satu room dapat memiliki banyak fasilitas.

---

# Table : room_availabilities

## Overview

Tabel `room_availabilities` merupakan tabel operasional yang menyimpan jumlah kamar yang tersedia untuk setiap tanggal.

Tabel ini dibuat agar sistem tidak perlu menghitung stok dari seluruh data booking setiap kali pengguna melakukan pencarian.

Dengan adanya tabel ini, proses pencarian kamar menjadi jauh lebih cepat.

---

## Purpose

Digunakan untuk:

- Menentukan apakah kamar tersedia.
- Mengurangi stok ketika booking berhasil.
- Mengembalikan stok ketika booking dibatalkan.
- Menampilkan jumlah kamar yang masih tersedia.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| room_type_id | bigint | No | FK Room |
| date | date | No | Tanggal |
| available_stock | integer | No | Sisa kamar |
| booked_room | integer | No | Jumlah kamar dipesan |
| created_at | timestamp | No | Dibuat |
| updated_at | timestamp | No | Diubah |

---

## Primary Key

id

---

## Foreign Key

room_type_id → room_types.id

---

## Relationships

room_types

↓

room_availabilities

(1:N)

---

## Business Rules

- Setiap kombinasi `room_type_id` dan `date` harus unik.
- `available_stock` tidak boleh negatif.
- Booking berhasil akan mengurangi stok pada setiap tanggal menginap.
- Booking dibatalkan atau Expired akan mengembalikan stok.
- Data digunakan sebagai acuan utama saat proses pencarian kamar.

---

## Example Data

| Room | Date | Stock |
|------|------|-------|
|Deluxe|2026-08-01|8|
|Deluxe|2026-08-02|7|
|Deluxe|2026-08-03|7|

---

# Table : room_price_histories

## Overview

Tabel `room_price_histories` menyimpan riwayat perubahan harga setiap tipe kamar.

Riwayat ini tidak digunakan untuk menghitung harga booking yang sudah terjadi, tetapi sebagai catatan historis perubahan tarif.

Saat booking dibuat, harga yang digunakan akan disalin ke tabel `booking_rooms` sehingga perubahan harga di masa depan tidak memengaruhi transaksi lama.

---

## Purpose

Digunakan untuk:

- Audit perubahan harga.
- Melihat histori tarif kamar.
- Analisis perubahan harga dari waktu ke waktu.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| room_type_id | bigint | No | FK Room |
| weekday_price | decimal | No | Harga weekday |
| weekend_price | decimal | No | Harga weekend |
| effective_from | date | No | Berlaku mulai |
| effective_until | date | Yes | Berlaku sampai |
| created_at | timestamp | No | Dibuat |
| updated_at | timestamp | No | Diubah |

---

## Primary Key

id

---

## Foreign Key

room_type_id → room_types.id

---

## Relationships

room_types

↓

room_price_histories

(1:N)

---

## Business Rules

- Setiap perubahan harga harus membuat record baru.
- Riwayat lama tidak boleh diubah.
- Hanya satu harga yang aktif dalam satu periode.
- Booking yang sudah dibuat tetap menggunakan harga yang tersimpan di `booking_rooms`.

---

# Room Module Relationships

```text
hotels
   │
   ▼
room_types
   │
   ├───────────────┐
   ▼               ▼
room_photos   booking_rooms
   │
   ▼
room_facilities
   ▲
   │
facilities

room_types
   │
   ├───────────────┐
   ▼               ▼
room_availabilities
room_price_histories
```

---

# Room Module Business Rules

### RM-001

Setiap Room wajib dimiliki oleh satu Hotel.

---

### RM-002

Room wajib memiliki minimal satu foto.

---

### RM-003

Room dapat memiliki banyak fasilitas.

---

### RM-004

Harga kamar dibedakan menjadi Weekday dan Weekend.

---

### RM-005

Perhitungan harga dilakukan berdasarkan tanggal menginap, bukan tanggal pemesanan.

---

### RM-006

Stok kamar dihitung per tanggal menggunakan tabel `room_availabilities`.

---

### RM-007

Perubahan harga kamar harus dicatat pada tabel `room_price_histories`.

---

### RM-008

Harga yang digunakan saat booking disimpan pada `booking_rooms` sebagai snapshot dan tidak berubah walaupun tarif kamar diperbarui di kemudian hari.

# 11.4 Booking Module

## Overview

Booking Module merupakan inti dari sistem H'Leven yang mengelola seluruh proses reservasi kamar hotel oleh pengguna.

Modul ini mencatat informasi pemesanan, kamar yang dipesan, data tamu, serta riwayat perubahan status booking.

Dengan memisahkan data ke beberapa tabel, sistem dapat menyimpan histori transaksi secara konsisten tanpa terpengaruh oleh perubahan data di masa mendatang.

---

## Tables

Booking Module terdiri dari empat tabel utama:

- bookings
- booking_rooms
- guests
- booking_status_histories

---

# Table : bookings

## Overview

Tabel `bookings` menyimpan informasi utama mengenai setiap transaksi pemesanan hotel.

Satu booking hanya dimiliki oleh satu user, tetapi dapat berisi satu atau lebih jenis kamar.

---

## Purpose

Digunakan untuk:

- Menyimpan transaksi booking.
- Menyimpan periode menginap.
- Menyimpan total pembayaran.
- Menentukan status booking.
- Menjadi induk seluruh proses pembayaran, review, dan e-ticket.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_code | varchar | No | Kode booking unik |
| user_id | bigint | No | Pemilik booking |
| hotel_id | bigint | No | Hotel yang dipesan |
| check_in | date | No | Tanggal check-in |
| check_out | date | No | Tanggal check-out |
| total_night | integer | No | Total malam |
| subtotal | decimal | No | Total harga kamar |
| tax | decimal | No | Pajak |
| grand_total | decimal | No | Total pembayaran |
| special_request | text | Yes | Permintaan khusus |
| status | enum | No | Status booking |
| created_at | timestamp | No | Dibuat |
| updated_at | timestamp | No | Diubah |

---

## Primary Key

id

---

## Foreign Key

user_id → users.id

hotel_id → hotels.id

---

## Relationships

users

↓

bookings

(1:N)

hotels

↓

bookings

(1:N)

bookings

↓

booking_rooms

(1:N)

bookings

↓

guests

(1:N)

bookings

↓

payments

(1:1)

bookings

↓

reviews

(1:1)

bookings

↓

e_tickets

(1:1)

bookings

↓

booking_status_histories

(1:N)

---

## Business Rules

- Booking Code harus unik.
- User wajib login sebelum membuat booking.
- Check-out harus lebih besar dari check-in.
- Booking minimal satu malam.
- Status awal booking adalah **Pending**.
- Total malam dihitung otomatis.
- Grand total dihitung otomatis.

---

## Example Data

| Booking Code | User | Hotel | Status |
|--------------|------|-------|--------|
|HLV240001|Budi|Grand Asia|Pending|

---

## Laravel Notes

Model

Booking.php

Migration

create_bookings_table.php

Factory

BookingFactory.php

Seeder

BookingSeeder.php

---

# Table : booking_rooms

## Overview

Tabel `booking_rooms` menyimpan detail kamar yang dipesan pada setiap booking.

Harga kamar disalin (snapshot) pada saat booking dibuat sehingga perubahan harga di masa depan tidak memengaruhi transaksi lama.

---

## Purpose

Digunakan untuk:

- Menyimpan kamar yang dipesan.
- Menyimpan jumlah kamar.
- Menyimpan harga saat booking.
- Menghitung subtotal.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | FK Booking |
| room_type_id | bigint | No | FK Room |
| qty | integer | No | Jumlah kamar |
| price_per_night | decimal | No | Harga per malam |
| subtotal | decimal | No | Total harga |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

room_type_id → room_types.id

---

## Relationships

bookings

↓

booking_rooms

room_types

↓

booking_rooms

---

## Business Rules

- Harga disalin dari room_types saat booking dibuat.
- Harga tidak boleh berubah setelah booking dibuat.
- Qty minimal satu.

---

## Example Data

| Booking | Room | Qty | Price |
|----------|------|-----|--------|
|HLV240001|Deluxe|2|450000|

---

# Table : guests

## Overview

Tabel `guests` menyimpan data tamu yang akan menginap.

Data tamu dapat berbeda dengan pemilik akun yang melakukan booking.

---

## Purpose

Digunakan untuk:

- Identitas tamu.
- Proses check-in.
- Verifikasi tamu.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | FK Booking |
| name | varchar | No | Nama tamu |
| phone | varchar | No | Nomor telepon |
| gender | enum | Yes | Jenis kelamin |
| identity_number | varchar | No | Nomor identitas |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

---

## Relationships

bookings

↓

guests

(1:N)

---

## Business Rules

- Minimal satu tamu pada setiap booking.
- Data tamu boleh berbeda dengan pemilik akun.
- Nomor identitas wajib diisi.

---

## Example Data

| Booking | Guest |
|----------|-------|
|HLV240001|Andi|

---

# Table : booking_status_histories

## Overview

Tabel `booking_status_histories` menyimpan riwayat perubahan status booking.

Riwayat ini digunakan untuk audit serta pelacakan perubahan status selama siklus hidup booking.

---

## Purpose

Digunakan untuk:

- Audit perubahan status.
- Menampilkan timeline booking.
- Pelacakan aktivitas.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | FK Booking |
| old_status | enum | Yes | Status sebelumnya |
| new_status | enum | No | Status baru |
| changed_by | bigint | Yes | User yang mengubah |
| changed_at | timestamp | No | Waktu perubahan |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

changed_by → users.id

---

## Relationships

bookings

↓

booking_status_histories

users

↓

booking_status_histories

---

## Business Rules

- Setiap perubahan status harus dicatat.
- Riwayat tidak boleh dihapus.
- Data hanya untuk audit.

---

## Example Data

| Booking | Old | New |
|----------|-----|-----|
|HLV240001|Pending|Paid|
|HLV240001|Paid|Checked In|

---

# Booking Status Flow

```text
Pending
   │
   ▼
Unpaid
   │
   ├──────────────┐
   ▼              ▼
Paid          Expired
   │
   ▼
Checked In
   │
   ▼
Checked Out
```

---

# Booking Module Relationships

```text
users
   │
   ▼
bookings
   │
   ├──────────────┬───────────────┬──────────────┐
   ▼              ▼               ▼              ▼
booking_rooms   guests        payments      booking_status_histories
   │                               │
   ▼                               ▼
room_types                     e_tickets
                                   │
                                   ▼
                                reviews
```

---

# Booking Module Business Rules

### BM-001

Booking hanya dapat dilakukan oleh User yang telah login.

---

### BM-002

Booking Code harus unik.

---

### BM-003

Booking minimal satu malam.

---

### BM-004

Check-out harus setelah check-in.

---

### BM-005

Harga yang digunakan saat booking merupakan snapshot dan tidak berubah setelah transaksi dibuat.

---

### BM-006

Booking yang belum dibayar hingga batas waktu pembayaran akan berubah menjadi **Expired**.

---

### BM-007

Booking yang sudah dibayar akan menghasilkan data pembayaran dan QR Code.

---

### BM-008

Review hanya dapat dibuat setelah status booking menjadi **Checked Out**.

---

### BM-009

Seluruh perubahan status booking harus dicatat pada `booking_status_histories`.

---

### BM-010

Pembatalan booking akan mengembalikan stok kamar pada tabel `room_availabilities`.

# 11.5 Payment Module

## Overview

Payment Module bertanggung jawab dalam mengelola seluruh proses pembayaran, refund, dan penerbitan E-Ticket pada sistem H'Leven.

Modul ini terintegrasi dengan layanan pembayaran **Midtrans** untuk memproses transaksi secara aman. Setelah pembayaran berhasil diverifikasi, sistem akan menghasilkan QR Code yang digunakan saat proses check-in.

Selain itu, sistem juga menyediakan fitur refund yang memungkinkan pengguna mengajukan pembatalan booking sesuai dengan kebijakan hotel.

---

## Tables

Payment Module terdiri dari tiga tabel utama:

- payments
- refunds
- e_tickets

---

# Table : payments

## Overview

Tabel `payments` menyimpan seluruh informasi transaksi pembayaran yang dilakukan oleh pengguna.

Setiap booking hanya memiliki satu data pembayaran (One-to-One).

Data pembayaran berasal dari Midtrans dan disimpan sebagai bukti transaksi.

---

## Purpose

Digunakan untuk:

- Menyimpan data pembayaran.
- Menyimpan status pembayaran.
- Menyimpan transaksi Midtrans.
- Menentukan apakah booking sudah dibayar.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | Foreign Key ke bookings |
| payment_method | enum | No | Metode pembayaran |
| payment_status | enum | No | Status pembayaran |
| gross_amount | decimal | No | Total pembayaran |
| transaction_id | varchar | Yes | ID transaksi Midtrans |
| order_id | varchar | Yes | Order ID Midtrans |
| snap_token | varchar | Yes | Snap Token Midtrans |
| paid_at | timestamp | Yes | Waktu pembayaran berhasil |
| expired_at | timestamp | Yes | Batas waktu pembayaran |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

---

## Relationships

bookings

↓

payments

(1:1)

---

## Business Rules

- Satu booking hanya memiliki satu pembayaran.
- Status awal pembayaran adalah **Pending**.
- Status pembayaran hanya dapat berubah berdasarkan callback Midtrans.
- Pembayaran yang melewati batas waktu akan berubah menjadi **Expired**.
- Pembayaran berhasil akan mengubah status booking menjadi **Paid**.

---

## Payment Status

- Pending
- Success
- Failed
- Expired
- Cancelled

---

## Example Data

| Booking | Status | Amount |
|----------|--------|--------|
|HLV240001|Pending|950000|
|HLV240002|Success|450000|

---

## Laravel Notes

Model

Payment.php

Migration

create_payments_table.php

API Integration

Midtrans Snap API

Webhook

Midtrans Notification Callback

---

# Table : refunds

## Overview

Tabel `refunds` menyimpan seluruh data pengajuan refund yang dilakukan oleh pengguna.

Refund hanya dapat diajukan apabila booking telah berhasil dibayar dan masih memenuhi kebijakan pembatalan hotel.

Setiap booking hanya dapat memiliki satu data refund.

---

## Purpose

Digunakan untuk:

- Menyimpan permintaan refund.
- Menyimpan alasan refund.
- Menyimpan status refund.
- Menyimpan riwayat persetujuan refund.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | Foreign Key ke bookings |
| requested_by | bigint | No | User yang mengajukan |
| approved_by | bigint | Yes | Admin Hotel yang memproses |
| reason | text | No | Alasan refund |
| status | enum | No | Status refund |
| requested_at | timestamp | No | Waktu pengajuan |
| approved_at | timestamp | Yes | Waktu persetujuan |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

requested_by → users.id

approved_by → users.id

---

## Relationships

bookings

↓

refunds

(1:1)

users

↓

refunds (requested_by)

(1:N)

users

↓

refunds (approved_by)

(1:N)

---

## Business Rules

- Refund hanya dapat diajukan setelah pembayaran berhasil.
- Setiap booking hanya dapat memiliki satu pengajuan refund.
- Refund harus diproses oleh Admin Hotel.
- Refund yang disetujui akan mengubah status booking menjadi **Cancelled**.
- Seluruh histori refund harus disimpan.

---

## Refund Status

- Pending
- Approved
- Rejected
- Completed

---

## Example Data

| Booking | Status | Requested By |
|----------|--------|--------------|
|HLV240001|Pending|Budi|

---

## Laravel Notes

Model

Refund.php

Migration

create_refunds_table.php

---

# Table : e_tickets

## Overview

Tabel `e_tickets` menyimpan tiket elektronik yang dihasilkan setelah pembayaran berhasil.

QR Code digunakan sebagai bukti reservasi saat proses check-in.

Pada Checkpoint 1, sistem hanya menghasilkan QR Code.

Pembuatan PDF E-Ticket akan diimplementasikan pada Checkpoint 2.

---

## Purpose

Digunakan untuk:

- Menyimpan QR Code.
- Menyimpan file PDF (Future Development).
- Verifikasi saat check-in.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | Foreign Key ke bookings |
| qr_code | varchar | No | Data QR Code |
| pdf_path | varchar | Yes | Lokasi PDF (CP2) |
| generated_at | timestamp | No | Waktu generate |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

---

## Relationships

bookings

↓

e_tickets

(1:1)

---

## Business Rules

- QR Code hanya dibuat setelah pembayaran berhasil.
- QR Code harus unik.
- QR Code hanya dapat digunakan satu kali untuk proses check-in.
- PDF E-Ticket merupakan fitur Checkpoint 2.

---

## Laravel Notes

Model

ETicket.php

Migration

create_e_tickets_table.php

Library

simple-qrcode

# 11.6 Review Module

## Overview

Review Module bertanggung jawab dalam mengelola ulasan dan penilaian yang diberikan oleh pengguna setelah menyelesaikan masa menginap.

Review hanya dapat dibuat oleh pengguna yang telah menyelesaikan proses check-out. Setiap booking hanya dapat memberikan satu review.

Data review digunakan untuk menghitung nilai rata-rata (Average Rating) dan jumlah ulasan (Total Review) pada setiap hotel.

---

## Tables

Review Module terdiri dari satu tabel utama:

- reviews

---

# Table : reviews

## Overview

Tabel `reviews` menyimpan penilaian dan komentar yang diberikan oleh pengguna terhadap hotel setelah booking selesai.

Review menjadi salah satu indikator kualitas hotel yang dapat dilihat oleh pengguna lain saat mencari hotel.

---

## Purpose

Digunakan untuk:

- Menyimpan rating hotel.
- Menyimpan komentar pengguna.
- Menghitung Average Rating.
- Menghitung Total Review.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| booking_id | bigint | No | Foreign Key ke bookings |
| hotel_id | bigint | No | Foreign Key ke hotels |
| user_id | bigint | No | Foreign Key ke users |
| rating | integer | No | Nilai rating (1-5) |
| comment | text | Yes | Komentar pengguna |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

id

---

## Foreign Key

booking_id → bookings.id

hotel_id → hotels.id

user_id → users.id

---

## Relationships

bookings

↓

reviews

(1:1)

hotels

↓

reviews

(1:N)

users

↓

reviews

(1:N)

---

## Business Rules

- Review hanya dapat dibuat setelah status booking menjadi **Checked Out**.
- Setiap booking hanya dapat memiliki satu review.
- Rating wajib diisi.
- Komentar bersifat opsional.
- Rating memiliki nilai antara **1 hingga 5**.

---

## Rating Scale

| Rating | Description |
|---------|-------------|
| 1 | Sangat Buruk |
| 2 | Buruk |
| 3 | Cukup |
| 4 | Baik |
| 5 | Sangat Baik |

---

## Example Data

| Booking | Hotel | Rating |
|----------|-------|--------|
|HLV240001|Grand Asia Hotel|5|
|HLV240002|Bandung Inn|4|

---

## Laravel Notes

Model

Review.php

Migration

create_reviews_table.php

Factory

ReviewFactory.php

Seeder

ReviewSeeder.php

---

# Review Module Relationships

```text
users
    │
    ▼
reviews
    ▲
    │
bookings

reviews
    │
    ▼
hotels
```

---

# Review Module Workflow

```text
Booking Paid
      │
      ▼
Checked In
      │
      ▼
Checked Out
      │
      ▼
User Gives Rating
      │
      ▼
Create Review
      │
      ▼
Update Hotel Average Rating
      │
      ▼
Update Hotel Total Review
```

---

# Review Module Business Rules

### RV-001

Review hanya dapat dibuat oleh pengguna yang telah menyelesaikan masa menginap.

---

### RV-002

Setiap booking hanya dapat memiliki satu review.

---

### RV-003

Rating wajib berada pada rentang 1 sampai 5.

---

### RV-004

Komentar bersifat opsional.

---

### RV-005

Average Rating hotel dihitung secara otomatis berdasarkan seluruh review yang tersedia.

---

### RV-006

Total Review hotel diperbarui secara otomatis setiap kali review ditambahkan atau dihapus.


# 11.8 Notification & Administration Module

## Overview

Notification & Administration Module merupakan modul pendukung yang membantu proses komunikasi antar pengguna serta aktivitas administrasi pada sistem H'Leven.

Modul ini bertanggung jawab dalam:

- Mengirim notifikasi kepada pengguna.
- Menyimpan histori aktivitas pengguna.
- Memberikan peringatan kepada Hotel Partner.
- Mendukung proses monitoring oleh Super Admin.

Modul ini tidak terlibat langsung dalam proses booking, namun berperan penting dalam pengelolaan sistem.

---

## Tables

Notification & Administration Module terdiri dari tiga tabel utama:

- notifications
- activity_logs
- warnings

---

# Table : notifications

## Overview

Tabel `notifications` menyimpan seluruh notifikasi yang diterima oleh pengguna.

Notifikasi dapat berasal dari berbagai aktivitas sistem seperti:

- Booking berhasil
- Pembayaran berhasil
- Booking dibatalkan
- Refund disetujui
- Hotel disetujui
- Hotel ditolak
- Warning dari Super Admin

---

## Purpose

Digunakan untuk:

- Menampilkan daftar notifikasi.
- Menandai notifikasi telah dibaca.
- Riwayat pemberitahuan sistem.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| user_id | bigint | No | Foreign Key ke users |
| title | varchar | No | Judul notifikasi |
| message | text | No | Isi notifikasi |
| type | varchar | No | Jenis notifikasi |
| is_read | boolean | No | Status dibaca |
| created_at | timestamp | No | Waktu dibuat |

---

## Primary Key

id

---

## Foreign Key

user_id → users.id

---

## Relationships

users

↓

notifications

(1:N)

---

## Business Rules

- Setiap notifikasi dimiliki oleh satu user.
- User dapat memiliki banyak notifikasi.
- Status awal adalah **Unread**.
- User dapat mengubah status menjadi **Read**.

---

## Example Data

| User | Title |
|------|-------|
|Budi|Pembayaran Berhasil|
|Andi|Refund Disetujui|

---

## Laravel Notes

Model

Notification.php

Migration

create_notifications_table.php

---

# Table : activity_logs

## Overview

Tabel `activity_logs` menyimpan histori aktivitas penting yang dilakukan oleh pengguna di dalam sistem.

Data ini digunakan untuk audit dan pelacakan aktivitas apabila terjadi kesalahan atau penyalahgunaan sistem.

---

## Purpose

Digunakan untuk:

- Audit aktivitas.
- Riwayat perubahan data.
- Monitoring pengguna.
- Analisis aktivitas sistem.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| user_id | bigint | No | Foreign Key ke users |
| activity | varchar | No | Nama aktivitas |
| description | text | Yes | Detail aktivitas |
| ip_address | varchar | Yes | Alamat IP |
| created_at | timestamp | No | Waktu aktivitas |

---

## Primary Key

id

---

## Foreign Key

user_id → users.id

---

## Relationships

users

↓

activity_logs

(1:N)

---

## Business Rules

- Setiap aktivitas penting dicatat.
- Data log tidak boleh diubah.
- Data log tidak boleh dihapus.
- Digunakan sebagai audit trail.

---

## Example Data

| User | Activity |
|------|----------|
|Admin Hotel|Create Room|
|User|Booking Hotel|
|Super Admin|Approve Hotel|

---

## Laravel Notes

Model

ActivityLog.php

Migration

create_activity_logs_table.php

---

# Table : warnings

## Overview

Tabel `warnings` menyimpan peringatan yang diberikan oleh Super Admin kepada Hotel Partner.

Warning diberikan apabila hotel melakukan pelanggaran terhadap kebijakan platform, seperti:

- Banyak komplain pengguna.
- Informasi hotel tidak sesuai.
- Pelayanan buruk.
- Penyalahgunaan sistem.

Warning akan muncul pada dashboard Admin Hotel sebagai pemberitahuan resmi.

---

## Purpose

Digunakan untuk:

- Memberikan teguran.
- Dokumentasi pelanggaran.
- Monitoring Hotel Partner.
- Riwayat tindakan Super Admin.

---

## Table Structure

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | bigint | No | Primary Key |
| hotel_id | bigint | No | Foreign Key ke hotels |
| super_admin_id | bigint | No | Foreign Key ke users |
| title | varchar | No | Judul warning |
| message | text | No | Isi warning |
| status | enum | No | Status warning |
| created_at | timestamp | No | Waktu dibuat |
| updated_at | timestamp | No | Waktu diperbarui |

---

## Primary Key

id

---

## Foreign Key

hotel_id → hotels.id

super_admin_id → users.id

---

## Relationships

hotels

↓

warnings

(1:N)

users

↓

warnings

(1:N)

---

## Business Rules

- Warning hanya dapat dibuat oleh Super Admin.
- Satu hotel dapat menerima banyak warning.
- Warning memiliki status:
  - Unread
  - Read
  - Closed
- Admin Hotel dapat membaca warning tetapi tidak dapat menghapusnya.

---

## Example Data

| Hotel | Status |
|--------|--------|
|Grand Asia|Unread|

---

## Laravel Notes

Model

Warning.php

Migration

create_warnings_table.php

---

# Notification & Administration Relationships

```text
users
   │
   ├─────────────┐
   ▼             ▼
notifications activity_logs

hotels
   │
   ▼
warnings
   ▲
   │
users (Super Admin)
```

---

# Notification & Administration Workflow

```text
User Activity
      │
      ▼
Create Activity Log
      │
      ▼
Generate Notification
      │
      ▼
User Reads Notification
```

```text
Hotel Violation
      │
      ▼
Super Admin Reviews
      │
      ▼
Create Warning
      │
      ▼
Warning Appears on Admin Hotel Dashboard
```

---

# Notification & Administration Business Rules

### NA-001

Setiap aktivitas penting pengguna harus dicatat pada `activity_logs`.

---

### NA-002

Notifikasi dikirim berdasarkan aktivitas tertentu di dalam sistem.

---

### NA-003

Setiap notifikasi dimiliki oleh satu pengguna.

---

### NA-004

Warning hanya dapat dibuat oleh Super Admin.

---

### NA-005

Satu hotel dapat menerima lebih dari satu warning.

---

### NA-006

Warning tidak dapat dihapus oleh Admin Hotel.

---

### NA-007

Seluruh data log digunakan sebagai audit trail dan tidak boleh dimodifikasi.


# 11.9 Database Relationship Summary

## Overview

Database H'Leven terdiri dari beberapa modul yang saling berhubungan untuk mendukung seluruh proses bisnis aplikasi, mulai dari autentikasi pengguna, pengelolaan hotel, reservasi kamar, pembayaran, hingga proses administrasi.

Hubungan antar tabel dirancang menggunakan Foreign Key sehingga menjaga integritas data (Referential Integrity) dan meminimalkan redundansi melalui penerapan Third Normal Form (3NF).

---

## Relationship Type

Database H'Leven menggunakan tiga jenis relasi utama.

### One-to-One (1:1)

Digunakan ketika satu data hanya boleh memiliki satu pasangan data.

Contoh:

- bookings ↔ payments
- bookings ↔ refunds
- bookings ↔ e_tickets
- bookings ↔ reviews

---

### One-to-Many (1:N)

Digunakan ketika satu data dapat memiliki banyak data turunan.

Contoh:

- users → hotels
- users → bookings
- hotels → room_types
- hotels → bookings
- bookings → booking_rooms
- bookings → guests
- room_types → room_photos
- room_types → room_availabilities
- room_types → room_price_histories

---

### Many-to-Many (N:M)

Relasi Many-to-Many direpresentasikan menggunakan tabel pivot.

Contoh:

Hotel ↔ Facility

menggunakan tabel

hotel_facilities

Room ↔ Facility

menggunakan tabel

room_facilities

---

# Module Relationship

## Authentication Module

users

↓

bookings

↓

reviews

↓

notifications

↓

activity_logs

↓

hotels (Admin Hotel)

---

## Hotel Module

cities

↓

hotels

↓

hotel_photos

↓

room_types

↓

hotel_facilities

---

## Room Module

room_types

↓

room_photos

↓

room_facilities

↓

room_availabilities

↓

room_price_histories

↓

booking_rooms

---

## Booking Module

bookings

↓

booking_rooms

↓

guests

↓

booking_status_histories

↓

payments

↓

refunds

↓

e_tickets

↓

reviews

---

## Administration Module

users

↓

notifications

↓

activity_logs

↓

warnings

---

## Partner Module

partner_applications

↓

partner_documents

---

# Database Dependency

Berikut urutan implementasi database berdasarkan ketergantungan antar tabel.

Level 1

- users
- cities
- facilities

↓

Level 2

- hotels
- partner_applications

↓

Level 3

- hotel_photos
- hotel_facilities
- room_types

↓

Level 4

- room_photos
- room_facilities
- room_availabilities
- room_price_histories

↓

Level 5

- bookings

↓

Level 6

- booking_rooms
- guests
- payments
- refunds
- e_tickets
- reviews
- booking_status_histories

↓

Level 7

- notifications
- activity_logs
- warnings
- partner_documents

---

# Relationship Matrix

| Parent Table | Child Table | Relationship |
|--------------|-------------|--------------|
| users | hotels | 1:N |
| users | bookings | 1:N |
| users | reviews | 1:N |
| users | notifications | 1:N |
| users | activity_logs | 1:N |
| users | warnings | 1:N |
| cities | hotels | 1:N |
| hotels | room_types | 1:N |
| hotels | hotel_photos | 1:N |
| hotels | bookings | 1:N |
| hotels | reviews | 1:N |
| hotels | warnings | 1:N |
| hotels | hotel_facilities | 1:N |
| room_types | room_photos | 1:N |
| room_types | room_availabilities | 1:N |
| room_types | room_price_histories | 1:N |
| room_types | booking_rooms | 1:N |
| room_types | room_facilities | 1:N |
| bookings | booking_rooms | 1:N |
| bookings | guests | 1:N |
| bookings | booking_status_histories | 1:N |
| bookings | payments | 1:1 |
| bookings | refunds | 1:1 |
| bookings | e_tickets | 1:1 |
| bookings | reviews | 1:1 |
| facilities | hotel_facilities | 1:N |
| facilities | room_facilities | 1:N |
| partner_applications | partner_documents | 1:N |

---

# Referential Integrity Rules

Seluruh Foreign Key pada database H'Leven harus mengikuti aturan berikut.

### RI-001

Child Table tidak boleh memiliki Foreign Key yang mengarah ke data Parent yang tidak ada.

---

### RI-002

Primary Key bersifat unik dan tidak boleh bernilai NULL.

---

### RI-003

Foreign Key harus memiliki tipe data yang sama dengan Primary Key yang dirujuk.

---

### RI-004

Data Parent tidak boleh dihapus apabila masih memiliki Child Data, kecuali menggunakan mekanisme Cascade atau Restrict sesuai kebutuhan sistem.

---

### RI-005

Seluruh transaksi database yang melibatkan lebih dari satu tabel wajib menggunakan Database Transaction Laravel untuk menjaga konsistensi data.

---

# Summary

Secara keseluruhan, database H'Leven terdiri dari:

- 24 Tabel
- 4 Relasi One-to-One
- 21 Relasi One-to-Many
- 2 Relasi Many-to-Many
- 2 Tabel Pivot
- 3 Modul Utama (Hotel, Room, Booking)
- 4 Modul Pendukung (Authentication, Payment, Administration, Partner)

Struktur database ini telah dirancang menggunakan prinsip Third Normal Form (3NF) sehingga mampu mendukung pengembangan sistem yang terstruktur, konsisten, dan mudah dikembangkan pada tahap implementasi berikutnya.

# 11.10 Database Business Rules

## Overview

Business Rules merupakan aturan yang mengatur bagaimana data diproses, disimpan, dan divalidasi dalam sistem H'Leven.

Seluruh aturan pada bagian ini harus diterapkan selama proses implementasi backend agar konsistensi data tetap terjaga.

---

# Authentication Rules

### BR-AUTH-001

Email pengguna harus unik.

---

### BR-AUTH-002

Password wajib disimpan menggunakan hashing (bcrypt).

---

### BR-AUTH-003

Setiap akun hanya memiliki satu role.

Role yang tersedia:

- User
- Admin Hotel
- Super Admin

---

### BR-AUTH-004

Pengguna dengan status **Blocked** tidak dapat mengakses sistem.

---

# Hotel Rules

### BR-HOTEL-001

Satu hotel hanya dimiliki oleh satu Admin Hotel.

---

### BR-HOTEL-002

Satu Admin Hotel dapat mengelola lebih dari satu hotel.

---

### BR-HOTEL-003

Hotel harus berada pada satu kota yang terdaftar.

---

### BR-HOTEL-004

Hotel wajib memiliki minimal satu foto.

---

### BR-HOTEL-005

Hotel wajib memiliki minimal satu tipe kamar sebelum dapat menerima booking.

---

### BR-HOTEL-006

Slug hotel harus unik.

---

### BR-HOTEL-007

Hotel dengan status selain **Active** tidak dapat menerima booking baru.

---

# Room Rules

### BR-ROOM-001

Setiap tipe kamar hanya dimiliki oleh satu hotel.

---

### BR-ROOM-002

Setiap tipe kamar wajib memiliki minimal satu foto.

---

### BR-ROOM-003

Harga weekday dan weekend harus lebih besar dari nol.

---

### BR-ROOM-004

Stock kamar minimal satu.

---

### BR-ROOM-005

Kapasitas kamar minimal satu orang dewasa.

---

### BR-ROOM-006

Perubahan harga harus dicatat pada tabel `room_price_histories`.

---

### BR-ROOM-007

Perhitungan harga menggunakan harga yang berlaku pada tanggal menginap.

---

### BR-ROOM-008

Ketersediaan kamar diperiksa menggunakan tabel `room_availabilities`.

---

# Booking Rules

### BR-BOOKING-001

Pengguna harus login sebelum membuat booking.

---

### BR-BOOKING-002

Booking minimal satu malam.

---

### BR-BOOKING-003

Tanggal check-out harus lebih besar dari tanggal check-in.

---

### BR-BOOKING-004

Booking Code harus unik.

---

### BR-BOOKING-005

Harga kamar yang digunakan saat booking disimpan sebagai snapshot pada tabel `booking_rooms`.

---

### BR-BOOKING-006

Stok kamar akan dikurangi setelah booking berhasil dibuat.

---

### BR-BOOKING-007

Apabila booking dibatalkan atau refund disetujui, stok kamar dikembalikan.

---

### BR-BOOKING-008

Data tamu boleh berbeda dengan pemilik akun.

---

### BR-BOOKING-009

Setiap perubahan status booking harus dicatat pada `booking_status_histories`.

---

# Payment Rules

### BR-PAYMENT-001

Setiap booking hanya memiliki satu transaksi pembayaran.

---

### BR-PAYMENT-002

Pembayaran diproses menggunakan Midtrans.

---

### BR-PAYMENT-003

Status pembayaran hanya boleh diperbarui berdasarkan callback resmi dari Midtrans.

---

### BR-PAYMENT-004

Booking yang tidak dibayar hingga batas waktu pembayaran akan berubah menjadi **Expired**.

---

### BR-PAYMENT-005

QR Code hanya dibuat apabila pembayaran berhasil.

---

### BR-PAYMENT-006

QR Code digunakan saat proses check-in hotel.

---

### BR-PAYMENT-007

Refund hanya dapat diajukan apabila masih sesuai dengan kebijakan pembatalan hotel.

---

### BR-PAYMENT-008

Refund harus diproses oleh Admin Hotel.

---

### BR-PAYMENT-009

Refund yang disetujui akan mengubah status booking menjadi **Cancelled**.

---

# Review Rules

### BR-REVIEW-001

Review hanya dapat dibuat setelah booking berstatus **Checked Out**.

---

### BR-REVIEW-002

Satu booking hanya dapat memberikan satu review.

---

### BR-REVIEW-003

Rating memiliki nilai antara 1 hingga 5.

---

### BR-REVIEW-004

Average Rating hotel dihitung secara otomatis dari seluruh review.

---

### BR-REVIEW-005

Total Review hotel diperbarui secara otomatis.

---

# Administration Rules

### BR-ADMIN-001

Warning hanya dapat dibuat oleh Super Admin.

---

### BR-ADMIN-002

Admin Hotel tidak dapat menghapus warning.

---

### BR-ADMIN-003

Seluruh aktivitas penting harus dicatat pada `activity_logs`.

---

### BR-ADMIN-004

Setiap notifikasi hanya dimiliki oleh satu pengguna.

---

### BR-ADMIN-005

Partner Hotel harus mendapatkan persetujuan Super Admin sebelum dapat mengakses Dashboard Admin Hotel.

---

# Database Integrity Rules

### BR-DATABASE-001

Seluruh tabel wajib memiliki Primary Key.

---

### BR-DATABASE-002

Seluruh relasi menggunakan Foreign Key.

---

### BR-DATABASE-003

Foreign Key tidak boleh mengarah pada data yang tidak ada.

---

### BR-DATABASE-004

Seluruh transaksi yang melibatkan lebih dari satu tabel harus menggunakan Database Transaction.

---

### BR-DATABASE-005

Data historis seperti pembayaran, refund, dan perubahan status tidak boleh dihapus.

---

### BR-DATABASE-006

Seluruh timestamp (`created_at` dan `updated_at`) dikelola otomatis oleh Laravel.

---

# Summary

Business Rules ini menjadi acuan utama dalam implementasi backend maupun frontend agar seluruh proses bisnis H'Leven berjalan secara konsisten.

Apabila terdapat perubahan proses bisnis pada masa pengembangan, maka perubahan tersebut harus diperbarui pada dokumentasi ini sebelum diimplementasikan ke dalam sistem.


# 11.11 Database Indexing & Performance

## Overview

Database H'Leven dirancang agar mampu menangani proses pencarian hotel, reservasi kamar, pembayaran, dan pelaporan secara efisien.

Untuk meningkatkan performa query, beberapa kolom diberikan index, unique constraint, maupun composite index sesuai kebutuhan proses bisnis.

Selain itu, penggunaan foreign key dan normalisasi Third Normal Form (3NF) membantu menjaga integritas data tanpa mengorbankan performa sistem.

---

# Primary Key Index

Seluruh tabel menggunakan Primary Key berupa `bigint` dengan fitur auto increment.

Contoh:

- users.id
- hotels.id
- room_types.id
- bookings.id
- payments.id

Primary Key secara otomatis memiliki index sehingga proses pencarian berdasarkan ID menjadi lebih cepat.

---

# Unique Index

Kolom berikut menggunakan Unique Index untuk mencegah data duplikat.

| Table | Column |
|---------|--------|
| users | email |
| hotels | slug |
| bookings | booking_code |
| payments | transaction_id |
| payments | order_id |
| e_tickets | qr_code |

---

# Foreign Key Index

Seluruh Foreign Key direkomendasikan memiliki index.

Contoh:

users

↓

bookings.user_id

---

hotels

↓

room_types.hotel_id

---

bookings

↓

payments.booking_id

---

bookings

↓

refunds.booking_id

---

room_types

↓

room_availabilities.room_type_id

---

Index pada Foreign Key mempercepat proses JOIN antar tabel.

---

# Composite Index

Beberapa query menggunakan lebih dari satu kolom sehingga membutuhkan Composite Index.

## room_availabilities

(room_type_id, date)

Digunakan saat mencari stok kamar berdasarkan tanggal.

---

## bookings

(user_id, status)

Digunakan untuk halaman Booking History.

---

## bookings

(hotel_id, check_in)

Digunakan Admin Hotel untuk melihat daftar booking.

---

## reviews

(hotel_id, rating)

Digunakan untuk menghitung rating hotel.

---

## notifications

(user_id, is_read)

Digunakan untuk menampilkan notifikasi yang belum dibaca.

---

# Search Optimization

## Hotel Search

Pencarian hotel menggunakan:

- city_id
- hotel name
- status

Index:

(city_id, status)

---

## Room Search

Pencarian kamar menggunakan:

- hotel_id
- room_type_id
- date

Data stok diambil dari:

room_availabilities

---

## Booking Search

Booking History menggunakan:

- user_id
- booking_code
- status

---

## Dashboard Admin Hotel

Dashboard Admin Hotel menggunakan:

- hotel_id
- booking status
- payment status

---

## Dashboard Super Admin

Dashboard Super Admin menggunakan:

- hotel status
- refund status
- partner status

---

# Performance Recommendations

Untuk menjaga performa database, diterapkan beberapa rekomendasi berikut.

### PI-001

Gunakan pagination untuk seluruh halaman daftar data.

Contoh:

- Hotel List
- Booking History
- Notifications
- Reviews

---

### PI-002

Gunakan eager loading Laravel (`with()`) untuk mengurangi masalah N+1 Query.

Contoh:

Booking::with([
'user',
'hotel',
'payment'
])

---

### PI-003

Gunakan Query Builder atau Eloquent Relationship sesuai kebutuhan agar query tetap mudah dipelihara.

---

### PI-004

Gunakan Database Transaction pada proses berikut:

- Booking
- Payment
- Refund
- Check In
- Check Out

---

### PI-005

Jangan melakukan perhitungan stok kamar secara langsung dari tabel booking.

Gunakan tabel:

room_availabilities

---

### PI-006

Gunakan snapshot harga pada tabel:

booking_rooms

agar histori transaksi tidak berubah ketika harga kamar diperbarui.

---

### PI-007

Lakukan validasi stok sebelum membuat booking baru.

---

### PI-008

Gunakan queue untuk proses yang tidak memerlukan respon langsung.

Contoh:

- Generate QR Code
- Generate PDF E-Ticket (CP2)
- Pengiriman Email (CP2)

---

# Expected Performance

Dengan struktur database saat ini, sistem diharapkan mampu menangani:

- Ribuan pengguna.
- Ribuan hotel.
- Puluhan ribu booking.
- Ratusan ribu histori pembayaran.

Tanpa perlu melakukan perubahan struktur database utama.

---

# Summary

Strategi indexing dan optimasi query pada H'Leven dirancang untuk:

- Mempercepat proses pencarian data.
- Mengurangi beban query JOIN.
- Menjaga konsistensi transaksi.
- Mendukung pengembangan sistem di masa depan.

Seluruh rekomendasi pada bagian ini harus menjadi acuan selama proses implementasi backend agar aplikasi tetap memiliki performa yang baik ketika jumlah data meningkat.

# 11.12 Database Security & Best Practices

## Overview

Database H'Leven dirancang dengan memperhatikan aspek keamanan, integritas data, dan kemudahan pemeliharaan.

Seluruh implementasi database harus mengikuti praktik terbaik (Best Practices) agar sistem tetap stabil, aman, dan mudah dikembangkan di masa mendatang.

Dokumen ini menjadi pedoman implementasi database bagi seluruh Backend Developer.

---

# Data Integrity

## Primary Key

Setiap tabel wajib memiliki Primary Key.

Primary Key digunakan sebagai identitas unik setiap data.

Contoh:

- users.id
- hotels.id
- room_types.id
- bookings.id

---

## Foreign Key

Seluruh relasi antar tabel menggunakan Foreign Key.

Foreign Key memastikan bahwa Child Table tidak dapat mengacu pada Parent yang tidak tersedia.

Contoh:

bookings.user_id

↓

users.id

---

payments.booking_id

↓

bookings.id

---

reviews.hotel_id

↓

hotels.id

---

## Unique Constraint

Beberapa data wajib bersifat unik.

Contoh:

- users.email
- hotels.slug
- bookings.booking_code
- payments.transaction_id
- payments.order_id
- e_tickets.qr_code

---

# Database Transaction

Seluruh proses yang mengubah lebih dari satu tabel wajib menggunakan Database Transaction.

Hal ini bertujuan untuk menjaga konsistensi data apabila terjadi kegagalan proses.

---

## Wajib Menggunakan Transaction

### Booking

Melibatkan:

- bookings
- booking_rooms
- guests
- room_availabilities

---

### Payment

Melibatkan:

- payments
- bookings
- e_tickets

---

### Refund

Melibatkan:

- refunds
- bookings
- room_availabilities

---

### Review

Melibatkan:

- reviews
- hotels

---

# Data Validation

Validasi dilakukan pada dua level:

## Application Validation

Menggunakan Laravel Form Request.

Contoh:

- Email
- Password
- Rating
- Tanggal Booking
- Harga

---

## Database Validation

Menggunakan:

- NOT NULL
- UNIQUE
- FOREIGN KEY
- CHECK Constraint (jika diperlukan)

---

# Cascade Rules

Setiap relasi memiliki aturan penghapusan data.

## Restrict

Digunakan apabila data Parent tidak boleh dihapus.

Contoh:

users

↓

bookings

---

bookings

↓

payments

---

## Cascade

Digunakan pada data pendukung.

Contoh:

hotels

↓

hotel_photos

---

room_types

↓

room_photos

---

hotel_facilities

↓

facilities

---

# Soft Delete

Tidak seluruh tabel memerlukan Soft Delete.

## Direkomendasikan menggunakan Soft Delete

- hotels
- room_types
- facilities

---

## Tidak menggunakan Soft Delete

- payments
- refunds
- reviews
- booking_status_histories
- activity_logs

Data histori harus tetap tersimpan sebagai audit trail.

---

# Audit Trail

Setiap aktivitas penting harus tercatat.

Menggunakan tabel:

- activity_logs
- booking_status_histories

Contoh aktivitas:

- Login
- Booking
- Payment
- Refund
- Create Hotel
- Update Room
- Approve Partner

---

# Authentication Security

Password wajib menggunakan hashing.

Laravel menggunakan:

bcrypt

atau

Argon2id

Password tidak boleh disimpan dalam bentuk Plain Text.

---

# Authorization

Hak akses menggunakan Role Based Access Control (RBAC).

Role terdiri dari:

- User
- Admin Hotel
- Super Admin

Setiap endpoint wajib melakukan pengecekan Role sebelum diproses.

---

# API Security

Seluruh API menggunakan:

- Laravel Sanctum
- Bearer Token
- Authentication Middleware
- Authorization Middleware

Endpoint yang memerlukan login tidak boleh dapat diakses tanpa token.

---

# File Storage

Seluruh gambar dan file disimpan pada Storage Laravel.

Contoh:

- Hotel Photo
- Room Photo
- QR Code
- PDF E-Ticket (Checkpoint 2)

Database hanya menyimpan path file.

Contoh:

storage/hotels/1/photo.jpg

---

# Backup Strategy

Direkomendasikan melakukan backup database secara berkala.

Jenis backup:

- Daily Backup
- Weekly Backup
- Monthly Backup

Backup harus disimpan pada lokasi yang berbeda dari server utama.

---

# Logging

Setiap error sistem harus dicatat menggunakan Laravel Log.

Contoh:

- Payment gagal
- Callback Midtrans gagal
- Upload gagal
- Database Error

---

# Performance Monitoring

Monitoring dilakukan terhadap:

- Query lambat
- Penggunaan Storage
- Jumlah Booking
- Jumlah Hotel
- Jumlah User

Data monitoring digunakan sebagai dasar optimasi sistem.

---

# Future Scalability

Database H'Leven dirancang agar mudah dikembangkan.

Pengembangan yang dapat ditambahkan di masa depan:

- Multi Hotel Chain
- Promo & Voucher
- Coupon System
- Loyalty Point
- Favorite Hotel
- Multi Payment Gateway
- Email Notification
- Push Notification
- Dynamic Pricing
- AI Recommendation

Seluruh fitur tersebut dapat ditambahkan tanpa mengubah struktur utama database.

---

# Best Practices

Selama pengembangan sistem, seluruh Backend Developer wajib mengikuti prinsip berikut.

### BP-001

Jangan menghapus data histori transaksi.

---

### BP-002

Gunakan Database Transaction pada proses kritis.

---

### BP-003

Gunakan Foreign Key pada seluruh relasi.

---

### BP-004

Gunakan Eloquent Relationship untuk mengurangi kompleksitas query.

---

### BP-005

Gunakan Eager Loading (`with()`) untuk menghindari N+1 Query.

---

### BP-006

Selalu lakukan validasi data sebelum disimpan ke database.

---

### BP-007

Gunakan Migration sebagai satu-satunya cara mengubah struktur database.

---

### BP-008

Gunakan Seeder dan Factory untuk kebutuhan development dan testing.

---

### BP-009

Jangan menyimpan data sensitif dalam bentuk Plain Text.

---

### BP-010

Seluruh perubahan struktur database harus diperbarui pada dokumentasi ERD sebelum diimplementasikan.

---

# Conclusion

Dokumentasi database H'Leven disusun sebagai acuan utama dalam proses implementasi backend maupun frontend.

Dengan menerapkan normalisasi Third Normal Form (3NF), penggunaan Foreign Key, Business Rules, Database Transaction, serta Best Practices yang telah dijelaskan, diharapkan sistem mampu menjaga konsistensi data, meningkatkan performa, serta memudahkan proses pengembangan dan pemeliharaan di masa mendatang.

Seluruh perubahan terhadap struktur database wajib diperbarui pada dokumentasi ini agar implementasi tetap selaras dengan desain sistem yang telah dirancang.


# API Documentation

## Overview

Dokumen ini berisi seluruh endpoint REST API yang digunakan pada sistem H'Leven.

Seluruh komunikasi antara Frontend dan Backend dilakukan menggunakan REST API berbasis JSON.

Backend dikembangkan menggunakan Laravel 12, sedangkan Frontend menggunakan React.js.

API ini dibagi menjadi tiga kelompok berdasarkan role pengguna, yaitu:

- User
- Admin Hotel
- Super Admin

Setiap endpoint dilindungi menggunakan Laravel Sanctum Authentication sesuai hak akses masing-masing role.



# Base URL

Development

http://localhost:8000/api

Production

https://api.hleven.com/api

---

## API Version

Current Version

v1

Endpoint

/api/v1/

Contoh

GET /api/v1/hotels

# Standard Response

Semua endpoint menggunakan format JSON yang konsisten.

Success

{
    "success": true,
    "message": "Success",
    "data": {}
}

Error

{
    "success": false,
    "message": "Validation Error",
    "errors": {}
}

# Authentication

Authentication menggunakan Laravel Sanctum.

Header

Authorization

Bearer {token}

Content-Type

application/json

Accept

application/json

# 1. API Overview

## Introduction

Application Programming Interface (API) merupakan media komunikasi antara Frontend dan Backend pada sistem H'Leven.

Seluruh proses bisnis aplikasi, seperti autentikasi pengguna, pencarian hotel, reservasi kamar, pembayaran, hingga proses administrasi dilakukan melalui RESTful API.

API dikembangkan menggunakan Laravel 12 sebagai Backend Framework dan menggunakan format pertukaran data JSON (JavaScript Object Notation).

Dokumentasi ini menjadi acuan utama bagi seluruh tim pengembang, baik Backend Developer maupun Frontend Developer, dalam proses implementasi sistem.

---

## Objectives

API Documentation bertujuan untuk:

- Menjelaskan seluruh endpoint yang tersedia.
- Menjelaskan struktur request dan response.
- Menjelaskan mekanisme autentikasi.
- Menjelaskan hak akses setiap role.
- Menjadi kontrak komunikasi antara Backend dan Frontend.
- Mempermudah proses maintenance dan pengembangan sistem.

---

## API Architecture

Seluruh komunikasi aplikasi menggunakan arsitektur Client-Server.

```text
+------------------+
|    React.js      |
|    Frontend      |
+---------+--------+
          |
          | HTTP Request
          |
          v
+------------------+
| Laravel REST API |
+---------+--------+
          |
          |
          v
+------------------+
| PostgreSQL DB    |
+------------------+
```

Frontend hanya berkomunikasi dengan REST API.

REST API bertanggung jawab terhadap:

- Validasi data
- Business Logic
- Database
- Authentication
- Authorization
- Response JSON

---

## API Style

H'Leven menggunakan standar RESTful API.

Method yang digunakan:

| Method | Function |
|----------|------------------------------|
| GET | Mengambil data |
| POST | Membuat data |
| PUT | Mengubah seluruh data |
| PATCH | Mengubah sebagian data |
| DELETE | Menghapus data |

---

## Response Format

Seluruh endpoint menggunakan format JSON.

Success Response

```json
{
    "success": true,
    "message": "Success",
    "data": {}
}
```

Error Response

```json
{
    "success": false,
    "message": "Validation Error",
    "errors": {}
}
```

---

## API Version

Versi API saat ini:

v1

Endpoint menggunakan prefix:

```
/api/v1/
```

Contoh:

```
GET /api/v1/hotels
```

---

## Base URL

Development

```
http://localhost:8000/api/v1
```

Production

```
https://api.hleven.com/api/v1
```

---

## Data Format

Seluruh data dikirim menggunakan JSON.

Header wajib:

```
Content-Type: application/json

Accept: application/json
```

Untuk endpoint yang memerlukan autentikasi:

```
Authorization: Bearer {access_token}
```

---

## HTTP Status Code

API menggunakan HTTP Status Code standar.

| Code | Description |
|------|-------------|
|200|Success|
|201|Created|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|500|Internal Server Error|

---

## User Roles

API dibagi menjadi tiga kelompok akses.

### User

Dapat mengakses:

- Profile
- Hotel
- Booking
- Payment
- Refund
- Review

---

### Admin Hotel

Dapat mengakses:

- Dashboard Admin
- CRUD Hotel
- CRUD Room
- Booking Hotel
- Refund Approval

---

### Super Admin

Dapat mengakses:

- Dashboard Super Admin
- Partner Approval
- Warning
- Monitoring
- Reporting

---

## Authentication

API menggunakan Laravel Sanctum.

Autentikasi dilakukan menggunakan Bearer Token.

Contoh Header:

```
Authorization: Bearer eyJhbGciOi...
```

Endpoint yang tidak memerlukan login:

- Login
- Register
- Hotel List
- Hotel Detail

Endpoint lainnya memerlukan autentikasi sesuai Role.

---

## Documentation Convention

Dokumentasi endpoint akan menggunakan format berikut:

### Endpoint

```
GET /hotels
```

### Description

Menjelaskan fungsi endpoint.

### Request

Parameter yang dikirim.

### Response

JSON Response.

### Authorization

Role yang dapat mengakses endpoint.

### Validation

Validasi request.

### Error Response

Kemungkinan error yang dapat terjadi.

# 2. Authentication API

## Overview

Authentication API bertanggung jawab dalam proses autentikasi dan otorisasi pengguna pada sistem H'Leven.

Modul ini memastikan bahwa setiap pengguna dapat mengakses sistem sesuai dengan hak akses (Role Based Access Control).

Pada Checkpoint 1, modul Authentication hanya mencakup:

- Login
- Logout
- Get Profile
- Update Profile
- Change Password

Fitur berikut akan diimplementasikan pada pengembangan selanjutnya:

- Register
- Google OAuth
- Email OTP
- Forgot Password

---

# Authentication Flow

```text
User
   │
   ▼
Login
   │
   ▼
Validate Credentials
   │
   ▼
Generate Sanctum Token
   │
   ▼
Return User + Token
   │
   ▼
Frontend Save Token
   │
   ▼
Authorized Request
```

---

# Authentication Middleware

Endpoint yang memerlukan autentikasi menggunakan middleware:

```
auth:sanctum
```

Endpoint yang memerlukan Role tertentu juga menggunakan middleware tambahan.

Contoh:

```
role:user

role:admin_hotel

role:super_admin
```

---

# Authentication Headers

Request yang membutuhkan autentikasi wajib mengirimkan header berikut:

```http
Authorization: Bearer {access_token}

Accept: application/json

Content-Type: application/json
```

---

# Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | /login | Login pengguna | Public |
| POST | /logout | Logout pengguna | User |
| GET | /me | Mendapatkan profil pengguna | User |
| PUT | /profile | Mengubah profil pengguna | User |
| PUT | /change-password | Mengubah password | User |

---

# Endpoint Detail

## POST /login

### Description

Melakukan autentikasi pengguna dan menghasilkan Access Token menggunakan Laravel Sanctum.

---

### Authorization

Public

---

### Request Body

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| email | required, email |
| password | required |

---

### Success Response

Status Code

```
200 OK
```

```json
{
    "success": true,
    "message": "Login berhasil.",
    "data": {
        "token": "1|xxxxxxxxxxxxxxxx",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "role": "user"
        }
    }
}
```

---

### Error Response

Email atau password salah.

```
401 Unauthorized
```

```json
{
    "success": false,
    "message": "Email atau password salah."
}
```

---

## POST /logout

### Description

Menghapus Access Token pengguna sehingga sesi login berakhir.

---

### Authorization

User

---

### Header

```
Authorization: Bearer Token
```

---

### Success Response

```
200 OK
```

```json
{
    "success": true,
    "message": "Logout berhasil."
}
```

---

## GET /me

### Description

Mengambil data pengguna yang sedang login.

---

### Authorization

User

---

### Success Response

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com",
        "phone": "08123456789",
        "role": "user",
        "avatar": "storage/avatar/user.jpg"
    }
}
```

---

## PUT /profile

### Description

Mengubah informasi profil pengguna.

---

### Authorization

User

---

### Request Body

```json
{
    "name": "John Doe",
    "phone": "08123456789"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| name | required |
| phone | nullable |

---

### Success Response

```json
{
    "success": true,
    "message": "Profil berhasil diperbarui."
}
```

---

## PUT /change-password

### Description

Mengubah password pengguna.

---

### Authorization

User

---

### Request Body

```json
{
    "current_password": "password123",
    "new_password": "password456",
    "new_password_confirmation": "password456"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| current_password | required |
| new_password | required, min:8, confirmed |

---

### Success Response

```json
{
    "success": true,
    "message": "Password berhasil diubah."
}
```

---

### Error Response

Password lama tidak sesuai.

```
422 Unprocessable Entity
```

```json
{
    "success": false,
    "message": "Password lama tidak sesuai."
}
```

---

# Authentication Rules

### AUTH-001

Email harus terdaftar sebelum pengguna dapat login.

---

### AUTH-002

Password disimpan menggunakan hashing.

---

### AUTH-003

Setiap login menghasilkan Access Token baru.

---

### AUTH-004

Logout menghapus Access Token aktif.

---

### AUTH-005

Pengguna hanya dapat mengubah profil miliknya sendiri.

---

### AUTH-006

Password baru minimal terdiri dari 8 karakter.

---

### AUTH-007

Endpoint yang memerlukan autentikasi harus menggunakan middleware `auth:sanctum`.

---

# Authentication Sequence

```text
POST /login
        │
        ▼
Validate Email
        │
        ▼
Validate Password
        │
        ▼
Create Sanctum Token
        │
        ▼
Return User + Token
        │
        ▼
Frontend Save Token
        │
        ▼
Authorized Request
```
# 4. Hotel API

## Overview

Hotel API merupakan modul yang bertanggung jawab dalam pengelolaan data hotel pada sistem H'Leven.

Modul ini digunakan oleh tiga role dengan hak akses yang berbeda.

- User
- Admin Hotel
- Super Admin

User hanya dapat melihat informasi hotel, sedangkan Admin Hotel bertanggung jawab untuk mengelola data hotel miliknya. Super Admin hanya memiliki akses monitoring terhadap seluruh hotel.

---

# Module Scope

Fitur yang tersedia pada modul Hotel meliputi:

- Menampilkan daftar hotel
- Menampilkan detail hotel
- Pencarian hotel
- Filter hotel
- CRUD Hotel
- Upload Foto Hotel
- Monitoring Hotel

---

# Access Permission

| Role | Permission |
|------|------------|
| User | View Hotel |
| Admin Hotel | CRUD Hotel Miliknya |
| Super Admin | View Semua Hotel |

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /hotels | Menampilkan daftar hotel | Public |
| GET | /hotels/{id} | Detail hotel | Public |
| GET | /hotels/search | Pencarian hotel | Public |
| POST | /hotels | Membuat hotel | Admin Hotel |
| PUT | /hotels/{id} | Mengubah hotel | Admin Hotel |
| DELETE | /hotels/{id} | Menghapus hotel | Admin Hotel |
| POST | /hotels/{id}/photos | Upload foto hotel | Admin Hotel |
| DELETE | /hotel-photos/{id} | Hapus foto hotel | Admin Hotel |

---

# GET /hotels

## Description

Menampilkan daftar hotel yang aktif.

---

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| city | string | Nama kota |
| check_in | date | Check In |
| check_out | date | Check Out |
| guest | integer | Jumlah tamu |
| min_price | number | Harga minimum |
| max_price | number | Harga maksimum |
| rating | integer | Rating minimum |
| page | integer | Pagination |

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Grand Hotel",
            "city": "Bandung",
            "thumbnail": "...",
            "starting_price": 350000,
            "rating": 4.8
        }
    ]
}
```

---

# GET /hotels/{id}

## Description

Menampilkan detail hotel beserta:

- Informasi hotel
- Foto hotel
- Fasilitas
- Daftar kamar
- Rating
- Review

---

### Success Response

```json
{
    "success": true,
    "data": {
        "hotel": {},
        "photos": [],
        "facilities": [],
        "rooms": [],
        "reviews": []
    }
}
```

---

# GET /hotels/search

## Description

Melakukan pencarian hotel berdasarkan kata kunci.

---

### Query

```
keyword=bandung
```

---

### Success Response

```json
{
    "success": true,
    "data": []
}
```

---

# POST /hotels

## Description

Membuat hotel baru.

---

### Authorization

Admin Hotel

---

### Request Body

```json
{
    "name": "Grand Hotel",
    "city_id": 1,
    "address": "Jl. Asia Afrika",
    "description": "Hotel nyaman."
}
```

---

### Validation

| Field | Rule |
|--------|------|
| name | required |
| city_id | exists:cities,id |
| address | required |
| description | nullable |

---

### Success Response

```
201 Created
```

```json
{
    "success": true,
    "message": "Hotel berhasil dibuat."
}
```

---

# PUT /hotels/{id}

## Description

Mengubah data hotel.

---

### Authorization

Admin Hotel

---

### Validation

Sama seperti endpoint POST.

---

### Success Response

```json
{
    "success": true,
    "message": "Hotel berhasil diperbarui."
}
```

---

# DELETE /hotels/{id}

## Description

Menghapus hotel.

---

### Authorization

Admin Hotel

---

### Business Rule

Hotel tidak dapat dihapus apabila:

- Memiliki booking aktif.
- Memiliki pembayaran yang belum selesai.

---

### Success Response

```json
{
    "success": true,
    "message": "Hotel berhasil dihapus."
}
```

---

# POST /hotels/{id}/photos

## Description

Mengunggah foto hotel.

---

### Authorization

Admin Hotel

---

### Content Type

```
multipart/form-data
```

---

### Validation

| Field | Rule |
|--------|------|
| photo | image |
| max | 5 MB |

---

### Success Response

```json
{
    "success": true,
    "message": "Foto berhasil diunggah."
}
```

---

# DELETE /hotel-photos/{id}

## Description

Menghapus foto hotel.

---

### Authorization

Admin Hotel

---

### Business Rule

Hotel harus tetap memiliki minimal satu foto.

---

### Success Response

```json
{
    "success": true,
    "message": "Foto berhasil dihapus."
}
```

---

# Business Rules

### HOTEL-001

Hotel hanya dapat dikelola oleh pemiliknya.

---

### HOTEL-002

Super Admin hanya dapat melihat data hotel.

---

### HOTEL-003

Hotel wajib memiliki minimal satu foto.

---

### HOTEL-004

Slug hotel dibuat otomatis dan harus unik.

---

### HOTEL-005

Hotel tidak dapat menerima booking apabila status tidak aktif.

---

### HOTEL-006

Alamat hotel wajib diisi.

---

### HOTEL-007

Koordinat latitude dan longitude bersifat opsional.

---

### HOTEL-008

Penghapusan hotel tidak diperbolehkan jika masih memiliki transaksi aktif.

---

# Sequence Diagram

```text
Admin Hotel
      │
      ▼
POST /hotels
      │
      ▼
Validation
      │
      ▼
Create Hotel
      │
      ▼
Generate Slug
      │
      ▼
Save Database
      │
      ▼
Response Success
```

# 5. Room API

## Overview

Room API bertanggung jawab dalam pengelolaan tipe kamar, fasilitas kamar, foto kamar, harga, dan ketersediaan kamar pada setiap hotel.

Setiap tipe kamar dimiliki oleh satu hotel dan dapat memiliki banyak foto, fasilitas, serta histori harga.

Room API menjadi dasar proses pencarian kamar, perhitungan harga, dan booking.

---

# Module Scope

Modul Room terdiri dari:

- CRUD Room Type
- Upload Room Photo
- Delete Room Photo
- Room Facility
- Room Availability
- Room Price History
- Room Detail

---

# Access Permission

| Role | Permission |
|------|------------|
| User | View Room |
| Admin Hotel | CRUD Room |
| Super Admin | View Room |

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /rooms | List Room |
| GET | /rooms/{id} | Room Detail |
| POST | /rooms | Create Room |
| PUT | /rooms/{id} | Update Room |
| DELETE | /rooms/{id} | Delete Room |
| POST | /rooms/{id}/photos | Upload Photo |
| DELETE | /room-photos/{id} | Delete Photo |
| GET | /rooms/{id}/availability | Room Availability |
| GET | /rooms/{id}/price-history | Price History |

---

# GET /rooms

## Description

Menampilkan seluruh tipe kamar berdasarkan hotel.

---

### Query Parameter

| Parameter | Type |
|-----------|------|
| hotel_id | integer |
| capacity | integer |
| breakfast | boolean |
| smoking | boolean |

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Deluxe Room",
            "weekday_price": 450000,
            "weekend_price": 550000,
            "stock": 20
        }
    ]
}
```

---

# GET /rooms/{id}

## Description

Menampilkan detail tipe kamar.

Meliputi:

- Informasi kamar
- Harga
- Foto
- Fasilitas
- Kapasitas

---

### Success Response

```json
{
    "success": true,
    "data": {
        "room": {},
        "photos": [],
        "facilities": []
    }
}
```

---

# POST /rooms

## Description

Membuat tipe kamar baru.

---

### Authorization

Admin Hotel

---

### Request Body

```json
{
    "hotel_id":1,
    "name":"Deluxe Room",
    "description":"...",
    "weekday_price":450000,
    "weekend_price":550000,
    "stock":20,
    "capacity_adult":2,
    "capacity_child":1,
    "breakfast":true,
    "smoking_area":false
}
```

---

### Validation

| Field | Rule |
|---------|------|
| hotel_id | exists |
| name | required |
| weekday_price | numeric |
| weekend_price | numeric |
| stock | integer |
| capacity_adult | integer |
| capacity_child | integer |

---

### Success Response

```json
{
    "success": true,
    "message":"Room berhasil dibuat."
}
```

---

# PUT /rooms/{id}

## Description

Mengubah data tipe kamar.

---

### Business Rule

Apabila harga berubah, sistem otomatis membuat histori harga pada tabel:

room_price_histories

---

### Success Response

```json
{
    "success": true,
    "message":"Room berhasil diperbarui."
}
```

---

# DELETE /rooms/{id}

## Description

Menghapus tipe kamar.

---

### Business Rule

Room tidak dapat dihapus apabila:

- Memiliki booking aktif.
- Memiliki transaksi yang belum selesai.

---

### Success Response

```json
{
    "success": true,
    "message":"Room berhasil dihapus."
}
```

---

# POST /rooms/{id}/photos

## Description

Upload foto kamar.

---

### Content Type

multipart/form-data

---

### Validation

| Field | Rule |
|---------|------|
| photo | image |
| max | 5 MB |

---

### Success Response

```json
{
    "success": true,
    "message":"Foto berhasil diupload."
}
```

---

# DELETE /room-photos/{id}

## Description

Menghapus foto kamar.

---

### Business Rule

Minimal satu foto harus tetap tersedia.

---

### Success Response

```json
{
    "success": true,
    "message":"Foto berhasil dihapus."
}
```

---

# GET /rooms/{id}/availability

## Description

Menampilkan stok kamar berdasarkan tanggal.

---

### Query

```
check_in=2026-09-01

check_out=2026-09-03
```

---

### Success Response

```json
{
    "success": true,
    "data":[
        {
            "date":"2026-09-01",
            "available_stock":18
        },
        {
            "date":"2026-09-02",
            "available_stock":17
        }
    ]
}
```

---

# GET /rooms/{id}/price-history

## Description

Menampilkan histori perubahan harga.

---

### Success Response

```json
{
    "success": true,
    "data":[]
}
```

---

# Business Rules

### ROOM-001

Room harus dimiliki satu hotel.

---

### ROOM-002

Harga weekday dan weekend wajib lebih besar dari nol.

---

### ROOM-003

Stock minimal satu.

---

### ROOM-004

Perubahan harga wajib dicatat pada room_price_histories.

---

### ROOM-005

Room wajib memiliki minimal satu foto.

---

### ROOM-006

Room tidak dapat dihapus apabila masih memiliki transaksi aktif.

---

### ROOM-007

Perhitungan booking menggunakan harga sesuai tanggal menginap.

---

### ROOM-008

Ketersediaan kamar menggunakan tabel room_availabilities.

---

# Sequence Diagram

```text
Admin Hotel
      │
      ▼
Create Room
      │
      ▼
Validation
      │
      ▼
Save Room
      │
      ▼
Create Room Availability
      │
      ▼
Success
```

# 6. Facility API

## Overview

Facility API bertanggung jawab dalam pengelolaan fasilitas yang tersedia pada sistem H'Leven.

Fasilitas dibagi menjadi dua kategori utama:

- Hotel Facility
- Room Facility

Setiap fasilitas dapat digunakan oleh banyak hotel maupun banyak tipe kamar melalui tabel relasi.

---

# Module Scope

Modul Facility terdiri dari:

- Master Facility
- Hotel Facility
- Room Facility

---

# Access Permission

| Role | Permission |
|------|------------|
| User | View Facility |
| Admin Hotel | Manage Hotel & Room Facility |
| Super Admin | View Facility |

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /facilities | List Facility | Public |
| GET | /facilities/{id} | Detail Facility | Public |
| POST | /facilities | Create Facility | Admin Hotel |
| PUT | /facilities/{id} | Update Facility | Admin Hotel |
| DELETE | /facilities/{id} | Delete Facility | Admin Hotel |
| POST | /hotel-facilities | Assign Facility to Hotel | Admin Hotel |
| DELETE | /hotel-facilities/{id} | Remove Hotel Facility | Admin Hotel |
| POST | /room-facilities | Assign Facility to Room | Admin Hotel |
| DELETE | /room-facilities/{id} | Remove Room Facility | Admin Hotel |

---

# GET /facilities

## Description

Menampilkan seluruh fasilitas yang tersedia.

---

### Query Parameter

| Parameter | Type |
|-----------|------|
| category | string |

Kategori:

- Hotel
- Room

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Swimming Pool",
            "category": "Hotel"
        },
        {
            "id": 2,
            "name": "WiFi",
            "category": "Room"
        }
    ]
}
```

---

# GET /facilities/{id}

## Description

Menampilkan detail fasilitas.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Swimming Pool",
        "category": "Hotel"
    }
}
```

---

# POST /facilities

## Description

Menambahkan fasilitas baru.

---

### Authorization

Admin Hotel

---

### Request Body

```json
{
    "name": "Smart TV",
    "category": "Room"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| name | required |
| category | in:Hotel,Room |

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil dibuat."
}
```

---

# PUT /facilities/{id}

## Description

Mengubah data fasilitas.

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil diperbarui."
}
```

---

# DELETE /facilities/{id}

## Description

Menghapus fasilitas.

---

### Business Rule

Facility tidak dapat dihapus apabila masih digunakan oleh hotel atau room.

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil dihapus."
}
```

---

# POST /hotel-facilities

## Description

Menambahkan fasilitas ke hotel.

---

### Authorization

Admin Hotel

---

### Request Body

```json
{
    "hotel_id": 1,
    "facility_id": 5
}
```

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil ditambahkan ke hotel."
}
```

---

# DELETE /hotel-facilities/{id}

## Description

Menghapus relasi fasilitas hotel.

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil dihapus dari hotel."
}
```

---

# POST /room-facilities

## Description

Menambahkan fasilitas ke tipe kamar.

---

### Authorization

Admin Hotel

---

### Request Body

```json
{
    "room_type_id": 3,
    "facility_id": 8
}
```

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil ditambahkan ke kamar."
}
```

---

# DELETE /room-facilities/{id}

## Description

Menghapus relasi fasilitas kamar.

---

### Success Response

```json
{
    "success": true,
    "message": "Facility berhasil dihapus dari kamar."
}
```

---

# Business Rules

### FACILITY-001

Setiap fasilitas memiliki satu kategori.

---

### FACILITY-002

Kategori fasilitas hanya terdiri dari:

- Hotel
- Room

---

### FACILITY-003

Satu fasilitas dapat digunakan oleh banyak hotel.

---

### FACILITY-004

Satu fasilitas dapat digunakan oleh banyak tipe kamar.

---

### FACILITY-005

Nama fasilitas sebaiknya unik untuk menghindari duplikasi.

---

### FACILITY-006

Fasilitas tidak dapat dihapus apabila masih memiliki relasi dengan hotel atau kamar.

---

# Sequence Diagram

```text
Admin Hotel
      │
      ▼
Create Facility
      │
      ▼
Validation
      │
      ▼
Save Facility
      │
      ▼
Success
```
# 7. Booking API

## Overview

Booking API merupakan modul utama pada sistem H'Leven yang bertanggung jawab dalam proses reservasi kamar hotel.

Modul ini mengelola seluruh siklus pemesanan, mulai dari pengecekan ketersediaan kamar, pembuatan booking, pengisian data tamu, perhitungan harga, hingga pembatalan booking.

Booking yang berhasil dibuat akan menghasilkan transaksi pembayaran yang selanjutnya diproses melalui Payment API.

---

# Module Scope

Booking API mencakup fitur berikut:

- Check Room Availability
- Calculate Booking Price
- Create Booking
- Booking Detail
- Booking History
- Cancel Booking
- Booking Status
- Guest Management

---

# Access Permission

| Role | Permission |
|------|------------|
| User | Create & View Own Booking |
| Admin Hotel | View Booking Hotel |
| Super Admin | View All Booking |

---

# Booking Workflow

```text
User
 │
 ▼
Pilih Hotel
 │
 ▼
Pilih Room
 │
 ▼
Check Availability
 │
 ▼
Input Guest
 │
 ▼
Calculate Price
 │
 ▼
Create Booking
 │
 ▼
Status = Pending Payment
 │
 ▼
Payment API
```

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /bookings | Booking History | User |
| GET | /bookings/{id} | Booking Detail | User |
| POST | /bookings | Create Booking | User |
| PATCH | /bookings/{id}/cancel | Cancel Booking | User |
| GET | /admin/bookings | Hotel Booking List | Admin Hotel |
| GET | /admin/bookings/{id} | Booking Detail | Admin Hotel |
| PATCH | /admin/bookings/{id}/check-in | Check In | Admin Hotel |
| PATCH | /admin/bookings/{id}/check-out | Check Out | Admin Hotel |

---

# GET /bookings

## Description

Menampilkan seluruh riwayat booking milik pengguna yang sedang login.

---

### Authorization

User

---

### Query Parameter

| Parameter | Type |
|-----------|------|
| status | string |
| page | integer |

Status dapat berupa:

- pending
- paid
- checked_in
- checked_out
- cancelled
- expired

---

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "booking_code": "HLV240001",
      "hotel": "Grand Hotel",
      "status": "paid",
      "check_in": "2026-08-15",
      "check_out": "2026-08-17",
      "grand_total": 1200000
    }
  ]
}
```

# GET /bookings/{id}

## Description

Menampilkan detail booking beserta informasi hotel, kamar, tamu, dan pembayaran.

---

### Authorization

User

---

### Success Response

```json
{
  "success": true,
  "data": {
    "booking": {},
    "hotel": {},
    "rooms": [],
    "guests": [],
    "payment": {}
  }
}
```

# POST /bookings

## Description

Membuat booking baru.

Endpoint ini akan:

- Memvalidasi tanggal.
- Memvalidasi stok kamar.
- Menghitung harga.
- Membuat booking.
- Menyimpan data tamu.
- Mengurangi stok kamar.
- Membuat data payment dengan status Pending.

---

### Authorization

User

---

### Request Body

```json
{
  "hotel_id": 1,
  "check_in": "2026-08-15",
  "check_out": "2026-08-17",
  "special_request": "Non Smoking",
  "rooms": [
    {
      "room_type_id": 2,
      "qty": 2
    }
  ],
  "guests": [
    {
      "name": "John Doe",
      "phone": "08123456789",
      "gender": "Male",
      "identity_number": "3276xxxxxxxx"
    }
  ]
}
```

---

### Validation

| Field | Rule |
|--------|------|
| hotel_id | exists |
| check_in | required |
| check_out | after:check_in |
| room_type_id | exists |
| qty | min:1 |

---

# Booking Business Rules

### BOOKING-001

Tanggal check-in tidak boleh kurang dari hari ini.

---

### BOOKING-002

Tanggal check-out harus lebih besar dari check-in.

---

### BOOKING-003

Room harus memiliki stok yang cukup.

---

### BOOKING-004

Harga dihitung berdasarkan:

- weekday_price
- weekend_price

sesuai tanggal menginap.

---

### BOOKING-005

Harga yang digunakan disimpan ke tabel:

booking_rooms

agar histori transaksi tidak berubah.

---

### BOOKING-006

Booking Code dibuat otomatis.

Format:

HLVYYYYMMXXXX

Contoh:

HLV2026080001

---

### BOOKING-007

Status awal booking adalah:

Pending Payment

---

### BOOKING-008

Setelah booking berhasil dibuat:

- room_availabilities dikurangi
- payment dibuat otomatis

# Booking Sequence

```text
User
 │
 ▼
Check Availability
 │
 ▼
Calculate Price
 │
 ▼
Database Transaction
 │
 ├── Create Booking
 ├── Create Booking Room
 ├── Create Guest
 ├── Update Room Availability
 └── Create Payment
 │
 ▼
Commit Transaction
 │
 ▼
Response Success
```
BookingController
        │
        ▼
BookingService
        │
        ├── AvailabilityService
        ├── PricingService
        ├── BookingCodeService
        ├── PaymentService
        └── RoomAvailabilityService
        │
        ▼
Database Transaction
        │
        ▼
Models (Booking, BookingRoom, Guest, Payment)



# 8. Payment API

## Overview

Payment API bertanggung jawab dalam proses pembayaran booking menggunakan Payment Gateway Midtrans.

Setelah booking berhasil dibuat, sistem akan membuat data pembayaran dengan status **Pending**. Pengguna kemudian melakukan pembayaran melalui Midtrans.

Setelah pembayaran berhasil, Midtrans akan mengirimkan callback ke sistem untuk memperbarui status pembayaran dan booking secara otomatis.

---

# Module Scope

Payment API mencakup fitur berikut:

- Create Payment
- Get Payment Detail
- Midtrans Snap Token
- Payment Callback
- Payment Status
- Expired Payment
- Manual Payment Sync

---

# Access Permission

| Role | Permission |
|------|------------|
| User | View Payment |
| Admin Hotel | View Payment Booking Hotel |
| Super Admin | View All Payment |
| Midtrans | Callback |

---

# Payment Flow

```text
Booking Created
      │
      ▼
Create Payment
      │
      ▼
Generate Snap Token
      │
      ▼
Frontend Open Midtrans Snap
      │
      ▼
User Payment
      │
      ▼
Midtrans Callback
      │
      ▼
Update Payment
      │
      ▼
Update Booking Status
```

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /payments/{id} | Payment Detail | User |
| POST | /payments/{id}/snap-token | Generate Snap Token | User |
| POST | /payments/callback | Midtrans Callback | Midtrans |
| GET | /payments/{id}/status | Payment Status | User |
| POST | /payments/{id}/sync | Manual Sync | Super Admin |

---

## Description

Menampilkan detail pembayaran berdasarkan booking.

---

### Authorization

User

---

### Success Response

```json
{
    "success": true,
    "data": {
        "payment_method": "midtrans",
        "payment_status": "pending",
        "gross_amount": 1200000,
        "expired_at": "2026-08-15 15:00:00"
    }
}
```

## Description

Menghasilkan Snap Token dari Midtrans.

Snap Token digunakan oleh Frontend untuk menampilkan halaman pembayaran Midtrans Snap.

---

### Authorization

User

---

### Success Response

```json
{
    "success": true,
    "data": {
        "snap_token": "xxxxxxxxxxxxxxxxxx"
    }
}
```

## Description

Endpoint webhook yang dipanggil oleh Midtrans setelah transaksi berubah.

Endpoint ini tidak dipanggil oleh Frontend.

---

### Authorization

Midtrans Server

---

### Request Body

Midtrans Notification Payload.

---

### Business Process

1. Verifikasi Signature Key.
2. Validasi Order ID.
3. Cari Payment.
4. Update Payment Status.
5. Update Booking Status.
6. Simpan Activity Log.
7. Kirim Response ke Midtrans.

---

### Success Response

```json
{
    "status": "success"
}
```

## Description

Mengambil status pembayaran terbaru.

Endpoint ini dapat digunakan Frontend untuk melakukan polling apabila callback belum diterima.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "payment_status": "success",
        "booking_status": "paid"
    }
}
```

## Description

Melakukan sinkronisasi status pembayaran secara manual ke Midtrans.

Digunakan apabila callback gagal diterima.

---

### Authorization

Super Admin

---

### Success Response

```json
{
    "success": true,
    "message": "Payment berhasil disinkronkan."
}
```

| Status | Description |
|----------|----------------------------|
| Pending | Menunggu pembayaran |
| Success | Pembayaran berhasil |
| Failed | Pembayaran gagal |
| Expired | Waktu pembayaran habis |
| Cancelled | Dibatalkan |

### PAYMENT-001

Setiap booking hanya memiliki satu pembayaran aktif.

---

### PAYMENT-002

Order ID menggunakan Booking Code.

Contoh:

HLV2026080001

---

### PAYMENT-003

Gross Amount harus sama dengan Grand Total Booking.

---

### PAYMENT-004

Status awal pembayaran adalah Pending.

---

### PAYMENT-005

Snap Token hanya dibuat satu kali untuk setiap pembayaran.

---

### PAYMENT-006

Signature Key callback wajib diverifikasi.

---

### PAYMENT-007

Jika pembayaran berhasil:

Booking Status → Paid

---

### PAYMENT-008

Jika pembayaran Expired:

Booking Status → Expired

Room Availability dikembalikan.

---

### PAYMENT-009

Jika pembayaran dibatalkan:

Booking Status → Cancelled

Room Availability dikembalikan.

---

### PAYMENT-010

Semua perubahan status pembayaran harus dicatat pada Activity Log.

```text
Booking
     │
     ▼
Create Payment
     │
     ▼
Generate Snap Token
     │
     ▼
Frontend
     │
     ▼
Midtrans Snap
     │
     ▼
Payment Success
     │
     ▼
Callback
     │
     ▼
Update Payment
     │
     ▼
Update Booking
     │
     ▼
Success
```

PaymentController
        │
        ▼
PaymentService
        │
        ├── MidtransService
        ├── CallbackService
        ├── SignatureService
        ├── PaymentSyncService
        └── ActivityLogService
        │
        ▼
Payment Repository
        │
        ▼
Database


# 9. Refund API

## Overview

Refund API bertanggung jawab dalam proses pengajuan dan pengelolaan pengembalian dana (refund) apabila terjadi pembatalan booking setelah pembayaran berhasil dilakukan.

Proses refund terdiri dari beberapa tahapan mulai dari pengajuan refund oleh pengguna, peninjauan oleh Super Admin, hingga penyelesaian refund.

---

# Module Scope

Refund API mencakup:

- Create Refund Request
- Refund Detail
- Refund List
- Approve Refund
- Reject Refund
- Refund History

---

# Access Permission

| Role | Permission |
|------|------------|
| User | Mengajukan & Melihat Refund |
| Admin Hotel | Melihat Refund Booking Hotel |
| Super Admin | Approve / Reject Refund |

---

# Refund Workflow

```text
User
 │
 ▼
Request Refund
 │
 ▼
Refund Status
Pending
 │
 ▼
Super Admin Review
 ├──────────────┐
 │              │
 ▼              ▼
Approve      Reject
 │              │
 ▼              ▼
Completed   Rejected
```

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /refunds | Refund List | User |
| GET | /refunds/{id} | Refund Detail | User |
| POST | /refunds | Create Refund | User |
| PATCH | /refunds/{id}/approve | Approve Refund | Super Admin |
| PATCH | /refunds/{id}/reject | Reject Refund | Super Admin |

---

## Description

Menampilkan seluruh riwayat refund milik pengguna.

---

### Authorization

User

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 5,
            "booking_code": "HLV2026080001",
            "refund_amount": 1200000,
            "status": "pending"
        }
    ]
}
```## Description

Menampilkan detail refund.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "booking": {},
        "payment": {},
        "refund": {}
    }
}
```
## Description

Mengajukan permintaan refund.

---

### Authorization

User

---

### Request Body

```json
{
    "booking_id": 15,
    "reason": "Perjalanan dibatalkan karena keadaan darurat."
}
```

---

### Validation

| Field | Rule |
|--------|------|
| booking_id | exists |
| reason | required|min:10 |

---

### Success Response

```json
{
    "success": true,
    "message": "Permintaan refund berhasil diajukan."
}
```

## Description

Menyetujui permintaan refund.

---

### Authorization

Super Admin

---

### Business Process

- Validasi refund.
- Update status refund menjadi Completed.
- Update booking menjadi Refunded.
- Catat Activity Log.
- Kirim notifikasi ke pengguna.

---

### Success Response

```json
{
    "success": true,
    "message": "Refund berhasil disetujui."
}
```

## Description

Menolak permintaan refund.

---

### Authorization

Super Admin

---

### Request Body

```json
{
    "reason": "Refund tidak memenuhi syarat."
}
```

---

### Success Response

```json
{
    "success": true,
    "message": "Refund berhasil ditolak."
}
```

| Status | Description |
|---------|-------------|
| Pending | Menunggu review |
| Approved | Disetujui |
| Rejected | Ditolak |
| Completed | Refund selesai |

### REFUND-001

Refund hanya dapat diajukan apabila pembayaran berstatus Success.

---

### REFUND-002

Satu booking hanya dapat memiliki satu permintaan refund.

---

### REFUND-003

Booking yang sudah Check Out tidak dapat mengajukan refund.

---

### REFUND-004

Pengajuan refund wajib menyertakan alasan.

---

### REFUND-005

Refund hanya dapat diproses oleh Super Admin.

---

### REFUND-006

Setiap perubahan status refund dicatat pada Activity Log.

---

### REFUND-007

Pengguna menerima notifikasi setiap terjadi perubahan status refund.

---

### REFUND-008

Refund yang selesai mengubah status booking menjadi Refunded.

```text
User
 │
 ▼
Create Refund
 │
 ▼
Pending
 │
 ▼
Super Admin Review
 │
 ├───────Approve────────┐
 │                      │
 ▼                      ▼
Completed           Notification
 │
 ▼
Activity Log
```

RefundController
        │
        ▼
RefundService
        │
        ├── RefundValidationService
        ├── NotificationService
        ├── ActivityLogService
        └── BookingService
        │
        ▼
Database

# 10. Review API

## Overview

Review API bertanggung jawab dalam pengelolaan ulasan dan penilaian hotel oleh pengguna.

Review hanya dapat diberikan oleh pengguna yang telah menyelesaikan proses menginap (Check Out). Setiap booking hanya dapat memberikan satu review.

Rating dan jumlah review akan digunakan untuk menghitung nilai rata-rata hotel yang ditampilkan pada halaman pencarian dan detail hotel.

---

# Module Scope

Review API mencakup:

- Create Review
- Update Review
- Delete Review
- Review Detail
- Review List
- Hotel Rating Summary

---

# Access Permission

| Role | Permission |
|------|------------|
| User | Create, Update, Delete Review Miliknya |
| Admin Hotel | View Review Hotel |
| Super Admin | View All Review |

---

# Review Workflow

```text
Booking
    │
    ▼
Status = Checked Out
    │
    ▼
User Create Review
    │
    ▼
Save Review
    │
    ▼
Recalculate Hotel Rating
    │
    ▼
Update Hotel
```

---

# Endpoint Summary

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /reviews | List Review User | User |
| GET | /reviews/{id} | Review Detail | User |
| POST | /reviews | Create Review | User |
| PUT | /reviews/{id} | Update Review | User |
| DELETE | /reviews/{id} | Delete Review | User |
| GET | /hotels/{id}/reviews | Hotel Reviews | Public |

---

## Description

Menampilkan seluruh review milik pengguna yang sedang login.

---

### Authorization

User

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 8,
            "hotel": "Grand Hotel",
            "rating": 5,
            "comment": "Pelayanan sangat baik."
        }
    ]
}
```
## Description

Menampilkan detail review.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "review": {},
        "hotel": {},
        "booking": {}
    }
}
```
## Description

Membuat review baru.

---

### Authorization

User

---

### Request Body

```json
{
    "booking_id": 20,
    "rating": 5,
    "comment": "Hotel bersih dan nyaman."
}
```

---

### Validation

| Field | Rule |
|--------|------|
| booking_id | exists |
| rating | integer|min:1|max:5 |
| comment | required|max:1000 |

---

### Success Response

```json
{
    "success": true,
    "message": "Review berhasil dikirim."
}
```
## Description

Mengubah review milik pengguna.

---

### Success Response

```json
{
    "success": true,
    "message": "Review berhasil diperbarui."
}
```
## Description

Menghapus review.

---

### Authorization

User

---

### Success Response

```json
{
    "success": true,
    "message": "Review berhasil dihapus."
}
```
## Description

Menampilkan seluruh review pada hotel tertentu.

Endpoint ini bersifat Public.

---

### Query Parameter

| Parameter | Type |
|-----------|------|
| page | integer |
| rating | integer |

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "user": "John Doe",
            "rating": 5,
            "comment": "Pelayanan memuaskan.",
            "created_at": "2026-08-20"
        }
    ]
}
```
### REVIEW-001

Review hanya dapat dibuat apabila booking berstatus Checked Out.

---

### REVIEW-002

Satu booking hanya dapat memiliki satu review.

---

### REVIEW-003

Pengguna hanya dapat mengubah review miliknya sendiri.

---

### REVIEW-004

Pengguna hanya dapat menghapus review miliknya sendiri.

---

### REVIEW-005

Rating harus berada pada rentang 1 hingga 5.

---

### REVIEW-006

Perubahan review akan memperbarui nilai average_rating dan total_review pada tabel hotels.

---

### REVIEW-007

Review yang dihapus akan mengurangi total_review dan menghitung ulang average_rating.

---

### REVIEW-008

Review tidak dapat dibuat untuk booking yang dibatalkan atau kedaluwarsa.

## Hotel Rating Calculation

Average Rating dihitung menggunakan rumus:

```
Average Rating =
Total Rating / Total Review
```

Contoh:

Review 1 = 5

Review 2 = 4

Review 3 = 5

Average Rating

```
(5+4+5)/3 = 4.67
```

Nilai tersebut akan disimpan pada tabel:

```
hotels.average_rating
```

Jumlah review disimpan pada:

```
hotels.total_review
```
```text
User
 │
 ▼
Submit Review
 │
 ▼
Validate Booking
 │
 ▼
Save Review
 │
 ▼
Calculate Average Rating
 │
 ▼
Update Hotel
 │
 ▼
Response Success
```
ReviewController
        │
        ▼
ReviewService
        │
        ├── RatingService
        ├── HotelService
        └── BookingValidationService
        │
        ▼
Database

# 11. Dashboard Admin API

## Overview

Dashboard Admin API menyediakan data statistik dan informasi operasional bagi Admin Hotel.

Seluruh data yang ditampilkan hanya berasal dari hotel yang dimiliki oleh Admin Hotel yang sedang login.

Dashboard ini bertujuan membantu admin dalam memantau performa bisnis hotel secara cepat tanpa harus membuka setiap menu satu per satu.

---

# Module Scope

Dashboard Admin terdiri dari:

- Summary Statistics
- Booking Statistics
- Revenue Statistics
- Room Occupancy
- Recent Booking
- Booking Chart
- Revenue Chart

---

# Access Permission

| Role | Permission |
|------|------------|
| User | ❌ |
| Admin Hotel | ✅ |
| Super Admin | ❌ |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /admin/dashboard | Dashboard Summary |
| GET | /admin/dashboard/revenue | Revenue Statistics |
| GET | /admin/dashboard/bookings | Booking Statistics |
| GET | /admin/dashboard/occupancy | Room Occupancy |
| GET | /admin/dashboard/recent-bookings | Recent Booking |
| GET | /admin/dashboard/charts | Dashboard Charts |

---

## Description

Menampilkan ringkasan informasi hotel.

---

### Authorization

Admin Hotel

---

### Success Response

```json
{
    "success": true,
    "data": {
        "total_rooms": 50,
        "available_rooms": 35,
        "occupied_rooms": 15,
        "today_booking": 8,
        "today_check_in": 4,
        "today_check_out": 2,
        "total_revenue": 150000000,
        "average_rating": 4.8
    }
}
```
## Description

Menampilkan statistik pendapatan.

---

### Query Parameter

| Parameter | Example |
|-----------|---------|
| month | 8 |
| year | 2026 |

---

### Success Response

```json
{
    "success": true,
    "data": {
        "daily": [],
        "monthly_total": 35000000,
        "yearly_total": 250000000
    }
}
```
## Description

Menampilkan statistik booking.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "pending": 2,
        "paid": 18,
        "checked_in": 10,
        "checked_out": 80,
        "cancelled": 3,
        "expired": 1
    }
}
```
## Description

Menampilkan tingkat okupansi kamar.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "total_room": 50,
        "occupied": 30,
        "available": 20,
        "occupancy_rate": "60%"
    }
}
```
## Description

Menampilkan 10 booking terbaru.

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "booking_code": "HLV2026080001",
            "guest_name": "John Doe",
            "status": "Paid",
            "check_in": "2026-08-12"
        }
    ]
}
```
## Description

Mengambil data grafik dashboard.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "booking_chart": [],
        "revenue_chart": [],
        "occupancy_chart": []
    }
}
```
### DASHBOARD-001

Dashboard hanya menampilkan data hotel milik Admin yang sedang login.

---

### DASHBOARD-002

Pendapatan hanya dihitung dari booking dengan status Paid atau Checked Out.

---

### DASHBOARD-003

Booking yang dibatalkan tidak dihitung sebagai pendapatan.

---

### DASHBOARD-004

Okupansi dihitung berdasarkan jumlah kamar yang sedang digunakan dibandingkan total stok kamar.

---

### DASHBOARD-005

Average Rating dihitung dari tabel reviews.

---

### DASHBOARD-006

Data grafik dapat difilter berdasarkan:

- Mingguan
- Bulanan
- Tahunan

---

### DASHBOARD-007

Dashboard diperbarui secara real-time setiap kali terjadi perubahan booking atau pembayaran.

```text
Admin Hotel
      │
      ▼
Request Dashboard
      │
      ▼
DashboardService
      │
      ├── BookingRepository
      ├── RoomRepository
      ├── ReviewRepository
      ├── PaymentRepository
      │
      ▼
Aggregate Statistics
      │
      ▼
Return Dashboard JSON
```
DashboardController
        │
        ▼
DashboardService
        │
        ├── RevenueService
        ├── BookingStatisticService
        ├── OccupancyService
        ├── RatingService
        └── ChartService
        │
        ▼
Database

# 12. Dashboard Super Admin API

## Overview

Dashboard Super Admin API menyediakan data statistik, monitoring, dan analitik untuk seluruh platform H'Leven.

Dashboard ini digunakan oleh Super Admin untuk memantau performa sistem, aktivitas pengguna, partner hotel, transaksi pembayaran, refund, dan laporan operasional secara keseluruhan.

Seluruh data pada dashboard merupakan agregasi dari seluruh hotel yang terdaftar pada sistem.

---

# Module Scope

Dashboard Super Admin terdiri dari:

- Platform Summary
- User Statistics
- Hotel Statistics
- Booking Statistics
- Payment Statistics
- Refund Statistics
- Revenue Statistics
- Partner Statistics
- Recent Activities
- Dashboard Charts

---

# Access Permission

| Role | Permission |
|------|------------|
| User | ❌ |
| Admin Hotel | ❌ |
| Super Admin | ✅ |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /super-admin/dashboard | Dashboard Summary |
| GET | /super-admin/dashboard/bookings | Booking Statistics |
| GET | /super-admin/dashboard/payments | Payment Statistics |
| GET | /super-admin/dashboard/refunds | Refund Statistics |
| GET | /super-admin/dashboard/revenue | Revenue Statistics |
| GET | /super-admin/dashboard/users | User Statistics |
| GET | /super-admin/dashboard/hotels | Hotel Statistics |
| GET | /super-admin/dashboard/partners | Partner Statistics |
| GET | /super-admin/dashboard/charts | Dashboard Charts |
| GET | /super-admin/dashboard/recent-activities | Recent Activities |

---


## Description

Menampilkan ringkasan statistik seluruh platform.

---

### Authorization

Super Admin

---

### Success Response

```json
{
    "success": true,
    "data": {
        "total_users": 1350,
        "total_hotels": 125,
        "total_rooms": 1840,
        "total_bookings": 8200,
        "active_bookings": 210,
        "today_revenue": 85000000,
        "pending_refunds": 8,
        "pending_partner_applications": 4
    }
}
```
## Description

Menampilkan statistik booking seluruh hotel.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "pending": 20,
        "paid": 420,
        "checked_in": 180,
        "checked_out": 7500,
        "cancelled": 45,
        "expired": 35,
        "refunded": 12
    }
}
```
## Description

Menampilkan statistik pembayaran.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "pending": 18,
        "success": 7900,
        "failed": 25,
        "expired": 32,
        "cancelled": 15,
        "total_transaction": 4500000000
    }
}
```

## Description

Menampilkan statistik refund.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "pending": 8,
        "approved": 15,
        "rejected": 3,
        "completed": 12,
        "total_refund_amount": 56000000
    }
}
```

## Description

Menampilkan statistik pendapatan platform.

---

### Query Parameter

| Parameter | Description |
|------------|-------------|
| month | Filter Bulan |
| year | Filter Tahun |

---

### Success Response

```json
{
    "success": true,
    "data": {
        "daily": [],
        "monthly_total": 620000000,
        "yearly_total": 7200000000
    }
}
```
## Description

Menampilkan statistik pengguna.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "total_users": 1350,
        "verified_users": 1180,
        "new_users_this_month": 95
    }
}
```

## Description

Menampilkan statistik hotel.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "active_hotels": 120,
        "inactive_hotels": 5,
        "pending_hotels": 4
    }
}
```

## Description

Menampilkan statistik pendaftaran partner hotel.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "pending": 4,
        "approved": 98,
        "rejected": 6
    }
}
```
## Description

Mengambil data grafik dashboard.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "booking_chart": [],
        "revenue_chart": [],
        "user_chart": [],
        "hotel_chart": [],
        "refund_chart": []
    }
}
```
## Description

Menampilkan aktivitas terbaru pada sistem.

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "activity": "Booking Created",
            "user": "John Doe",
            "time": "2026-08-10 14:30:00"
        },
        {
            "activity": "Payment Success",
            "user": "Jane Smith",
            "time": "2026-08-10 14:28:00"
        }
    ]
}
```
### DASHBOARD-SA-001

Dashboard hanya dapat diakses oleh Super Admin.

---

### DASHBOARD-SA-002

Seluruh statistik merupakan agregasi dari semua hotel.

---

### DASHBOARD-SA-003

Pendapatan hanya dihitung dari pembayaran berstatus Success.

---

### DASHBOARD-SA-004

Refund hanya menghitung refund yang telah disetujui atau selesai.

---

### DASHBOARD-SA-005

Grafik dapat difilter berdasarkan:

- Harian
- Mingguan
- Bulanan
- Tahunan

---

### DASHBOARD-SA-006

Recent Activities diambil dari tabel activity_logs.

---

### DASHBOARD-SA-007

Data dashboard diperbarui secara real-time setelah terjadi perubahan transaksi.

```text
Super Admin
      │
      ▼
Request Dashboard
      │
      ▼
DashboardService
      │
      ├── UserService
      ├── HotelService
      ├── BookingService
      ├── PaymentService
      ├── RefundService
      ├── PartnerService
      └── ActivityLogService
      │
      ▼
Aggregate Statistics
      │
      ▼
Return JSON Response
```

DashboardController
        │
        ▼
SuperAdminDashboardService
        │
        ├── UserStatisticService
        ├── HotelStatisticService
        ├── BookingStatisticService
        ├── RevenueService
        ├── RefundStatisticService
        ├── PartnerStatisticService
        ├── ActivityLogService
        └── DashboardChartService
        │
        ▼
Repository
        │
        ▼
Database

# 13. Partner Application API

## Overview

Partner Application API digunakan untuk mengelola proses pendaftaran hotel baru yang ingin bergabung dengan platform H'Leven.

Calon partner dapat mengirimkan data hotel beserta dokumen pendukung. Selanjutnya Super Admin melakukan proses verifikasi dan memberikan keputusan berupa persetujuan atau penolakan.

Apabila pengajuan disetujui, akun Admin Hotel dapat dibuat untuk mengelola hotel tersebut.

---

# Module Scope

Partner Application mencakup:

- Submit Application
- Upload Documents
- Application Detail
- Application List
- Approve Application
- Reject Application

---

# Access Permission

| Role | Permission |
|------|------------|
| Public | Submit Application |
| Super Admin | Manage Application |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /partner-applications | List Application |
| GET | /partner-applications/{id} | Application Detail |
| POST | /partner-applications | Submit Application |
| POST | /partner-documents | Upload Document |
| PATCH | /partner-applications/{id}/approve | Approve |
| PATCH | /partner-applications/{id}/reject | Reject |

---

### Description

Menampilkan seluruh pengajuan partner.

---

### Authorization

Super Admin

---

### Query Parameter

| Parameter | Description |
|-----------|-------------|
| status | pending / approved / rejected |
| page | Pagination |

---

### Success Response

```json
{
  "success": true,
  "data": []
}
```

---

### Description

Menampilkan detail pengajuan partner.

---

### Authorization

Super Admin

---

### Success Response

```json
{
  "success": true,
  "data": {
    "application": {},
    "documents": []
  }
}
```

---

### Description

Mengirim pengajuan kerja sama sebagai partner hotel.

---

### Authorization

Public

---

### Request Body

```json
{
  "owner_name": "John Doe",
  "hotel_name": "Sunrise Hotel",
  "email": "owner@example.com",
  "phone": "08123456789"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| owner_name | required |
| hotel_name | required |
| email | email |
| phone | required |

---

### Success Response

```json
{
  "success": true,
  "message": "Pengajuan berhasil dikirim."
}
```

---

### Description

Mengunggah dokumen pendukung partner.

---

### Authorization

Public

---

### Content Type

multipart/form-data

---

### Request

| Field | Type |
|--------|------|
| partner_application_id | integer |
| document_type | string |
| file | file |

---

### Validation

- PDF/JPG/PNG
- Maksimal 5 MB

---

### Success Response

```json
{
  "success": true,
  "message": "Dokumen berhasil diunggah."
}
```

---

### Description

Menyetujui pengajuan partner.

---

### Authorization

Super Admin

---

### Business Process

- Verifikasi data partner.
- Verifikasi dokumen.
- Ubah status menjadi Approved.
- Buat akun Admin Hotel (opsional, sesuai alur bisnis).
- Catat Activity Log.
- Kirim notifikasi.

---

### Success Response

```json
{
  "success": true,
  "message": "Partner berhasil disetujui."
}
```

---

### Description

Menolak pengajuan partner.

---

### Authorization

Super Admin

---

### Request Body

```json
{
  "reason": "Dokumen tidak lengkap."
}
```

---

### Success Response

```json
{
  "success": true,
  "message": "Pengajuan partner ditolak."
}
```

---

| Status | Description |
|---------|-------------|
| Pending | Menunggu verifikasi |
| Approved | Disetujui |
| Rejected | Ditolak |

### PARTNER-001

Setiap email hanya dapat memiliki satu pengajuan aktif.

---

### PARTNER-002

Minimal satu dokumen wajib diunggah sebelum proses verifikasi.

---

### PARTNER-003

Hanya Super Admin yang dapat menyetujui atau menolak pengajuan.

---

### PARTNER-004

Setiap perubahan status dicatat pada Activity Log.

---

### PARTNER-005

Pengguna menerima notifikasi ketika status pengajuan berubah.

---

### PARTNER-006

Partner yang disetujui dapat dibuatkan akun Admin Hotel untuk mengelola hotelnya.

```text
Partner
   │
   ▼
Submit Application
   │
   ▼
Upload Documents
   │
   ▼
Pending Review
   │
   ▼
Super Admin Review
   │
 ┌─┴─────────────┐
 ▼               ▼
Approve       Reject
 │               │
 ▼               ▼
Notification   Notification
```

PartnerApplicationController
            │
            ▼
PartnerApplicationService
            │
            ├── DocumentService
            ├── ApprovalService
            ├── NotificationService
            ├── ActivityLogService
            └── UserProvisionService
            │
            ▼
Repository
            │
            ▼
Database

# 14. Warning API

## Overview

Warning API digunakan oleh Super Admin untuk memberikan peringatan kepada hotel yang melanggar kebijakan platform atau memiliki permasalahan operasional.

Warning akan tercatat sebagai riwayat dan dapat dilihat oleh Admin Hotel pada dashboard mereka.

---

# Module Scope

Warning API mencakup:

- Create Warning
- Warning List
- Warning Detail
- Update Warning Status
- Delete Warning

---

# Access Permission

| Role | Permission |
|------|------------|
| User | ❌ |
| Admin Hotel | View Warning |
| Super Admin | Full Access |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /warnings | List Warning |
| GET | /warnings/{id} | Warning Detail |
| POST | /warnings | Create Warning |
| PATCH | /warnings/{id}/status | Update Status |
| DELETE | /warnings/{id} | Delete Warning |

---

## Description

Menampilkan daftar warning.

Admin Hotel hanya dapat melihat warning milik hotelnya.

Super Admin dapat melihat seluruh warning.

---

### Query Parameter

| Parameter | Description |
|-----------|-------------|
| hotel_id | Filter Hotel |
| status | pending / resolved |
| page | Pagination |

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 10,
            "hotel": "Grand Hotel",
            "title": "Data Hotel Tidak Lengkap",
            "status": "pending",
            "created_at": "2026-09-01"
        }
    ]
}
```

---

## Description

Menampilkan detail warning.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "hotel": {},
        "warning": {}
    }
}
```

---

## Description

Membuat warning baru.

---

### Authorization

Super Admin

---

### Request Body

```json
{
    "hotel_id": 5,
    "title": "Foto Hotel Tidak Sesuai",
    "message": "Mohon memperbarui foto hotel karena tidak sesuai dengan kondisi sebenarnya."
}
```

---

### Validation

| Field | Rule |
|--------|------|
| hotel_id | exists |
| title | required|max:100 |
| message | required|max:1000 |

---

### Success Response

```json
{
    "success": true,
    "message": "Warning berhasil dibuat."
}
```

---

## Description

Mengubah status warning.

---

### Authorization

Super Admin

---

### Request Body

```json
{
    "status": "resolved"
}
```

---

### Success Response

```json
{
    "success": true,
    "message": "Status warning berhasil diperbarui."
}
```

---

## Description

Menghapus warning.

---

### Authorization

Super Admin

---

### Success Response

```json
{
    "success": true,
    "message": "Warning berhasil dihapus."
}
```

---

| Status | Description |
|---------|-------------|
| Pending | Menunggu tindak lanjut |
| Resolved | Sudah diselesaikan |

### WARNING-001

Hanya Super Admin yang dapat membuat warning.

---

### WARNING-002

Warning harus ditujukan kepada satu hotel.

---

### WARNING-003

Admin Hotel hanya dapat melihat warning milik hotelnya.

---

### WARNING-004

Status awal warning adalah **Pending**.

---

### WARNING-005

Warning dapat diubah menjadi **Resolved** setelah masalah selesai.

---

### WARNING-006

Setiap pembuatan atau perubahan warning dicatat pada Activity Log.

---

### WARNING-007

Saat warning dibuat, sistem mengirimkan notifikasi kepada Admin Hotel.

```text
Super Admin
      │
      ▼
Create Warning
      │
      ▼
Save Warning
      │
      ▼
Create Notification
      │
      ▼
Create Activity Log
      │
      ▼
Response Success
```

WarningController
        │
        ▼
WarningService
        │
        ├── NotificationService
        ├── ActivityLogService
        └── WarningRepository
        │
        ▼
Database

# 15. Notification API

## Overview

Notification API bertanggung jawab dalam pengelolaan notifikasi yang diterima oleh pengguna sistem.

Notifikasi dibuat secara otomatis oleh sistem ketika terjadi suatu aktivitas penting, seperti booking baru, pembayaran berhasil, refund, warning, maupun persetujuan partner.

Notification API hanya mengelola data notifikasi. Pengiriman Email atau Push Notification merupakan tanggung jawab service lain.

---

# Module Scope

Notification API mencakup:

- Notification List
- Notification Detail
- Mark as Read
- Mark All as Read
- Delete Notification

---

# Access Permission

| Role | Permission |
|------|------------|
| User | Manage Own Notification |
| Admin Hotel | Manage Own Notification |
| Super Admin | Manage Own Notification |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /notifications | Notification List |
| GET | /notifications/{id} | Notification Detail |
| PATCH | /notifications/{id}/read | Mark as Read |
| PATCH | /notifications/read-all | Mark All as Read |
| DELETE | /notifications/{id} | Delete Notification |

---

## Description

Menampilkan daftar notifikasi milik pengguna yang sedang login.

---

### Authorization

Authenticated User

---

### Query Parameter

| Parameter | Description |
|-----------|-------------|
| is_read | true / false |
| type | booking, payment, refund, warning, partner |
| page | Pagination |

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 12,
            "title": "Pembayaran Berhasil",
            "message": "Booking HLV2026080001 telah berhasil dibayar.",
            "type": "payment",
            "is_read": false,
            "created_at": "2026-09-01 14:00:00"
        }
    ]
}
```

## Description

Menampilkan detail notifikasi.

---

### Authorization

Authenticated User

---

### Success Response

```json
{
    "success": true,
    "data": {
        "id": 12,
        "title": "Pembayaran Berhasil",
        "message": "Booking HLV2026080001 telah berhasil dibayar.",
        "type": "payment",
        "is_read": false
    }
}
```

## Description

Menandai satu notifikasi sebagai telah dibaca.

---

### Authorization

Authenticated User

---

### Success Response

```json
{
    "success": true,
    "message": "Notification berhasil ditandai sebagai telah dibaca."
}
```

## Description

Menandai seluruh notifikasi milik pengguna sebagai telah dibaca.

---

### Authorization

Authenticated User

---

### Success Response

```json
{
    "success": true,
    "message": "Seluruh notification berhasil ditandai sebagai telah dibaca."
}
```

## Description

Menghapus notifikasi.

---

### Authorization

Authenticated User

---

### Success Response

```json
{
    "success": true,
    "message": "Notification berhasil dihapus."
}
```

| Type | Description |
|------|-------------|
| booking | Booking berhasil dibuat |
| payment | Pembayaran |
| refund | Refund |
| warning | Warning Hotel |
| partner | Partner Application |
| system | Informasi Sistem |

### NOTIFICATION-001

Setiap notifikasi dimiliki oleh satu pengguna (`user_id`).

---

### NOTIFICATION-002

Status awal notifikasi adalah **Unread** (`is_read = false`).

---

### NOTIFICATION-003

Notifikasi dibuat secara otomatis oleh sistem.

---

### NOTIFICATION-004

Pengguna hanya dapat melihat notifikasi miliknya sendiri.

---

### NOTIFICATION-005

Notifikasi yang dihapus tidak dapat dikembalikan.

---

### NOTIFICATION-006

Endpoint **Mark All as Read** hanya mengubah notifikasi milik pengguna yang sedang login.

---

### NOTIFICATION-007

Notification Service dapat dipanggil oleh:

- Booking Service
- Payment Service
- Refund Service
- Partner Service
- Warning Service

```text
Booking Service
Payment Service
Refund Service
Warning Service
Partner Service
        │
        ▼
Notification Service
        │
        ▼
Create Notification
        │
        ▼
Save Database
        │
        ▼
User Notification
```

NotificationController
          │
          ▼
NotificationService
          │
          ├── NotificationRepository
          ├── UserRepository
          └── EventDispatcher
          │
          ▼
Database

# 16. Activity Log API

## Overview

Activity Log API digunakan untuk mencatat seluruh aktivitas penting yang terjadi di dalam sistem H'Leven.

Activity Log berfungsi sebagai audit trail sehingga setiap perubahan data dapat ditelusuri kembali. Log dibuat secara otomatis oleh sistem dan tidak dapat diubah oleh pengguna.

---

# Module Scope

Activity Log mencakup:

- Activity List
- Activity Detail
- Activity Filter

---

# Access Permission

| Role | Permission |
|------|------------|
| User | ❌ |
| Admin Hotel | View Hotel Activity |
| Super Admin | View All Activity |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /activity-logs | List Activity |
| GET | /activity-logs/{id} | Activity Detail |

---

# GET /activity-logs

## Description

Menampilkan daftar aktivitas.

Admin Hotel hanya dapat melihat aktivitas pada hotel yang dikelolanya.

Super Admin dapat melihat seluruh aktivitas.

---

### Query Parameter

| Parameter | Description |
|-----------|-------------|
| user_id | Filter User |
| activity | Filter Activity |
| start_date | Filter Tanggal Awal |
| end_date | Filter Tanggal Akhir |
| page | Pagination |

---

### Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": 100,
            "user": "John Doe",
            "activity": "Create Booking",
            "description": "Booking HLV2026080001 berhasil dibuat.",
            "ip_address": "127.0.0.1",
            "created_at": "2026-08-10 14:30:00"
        }
    ]
}
```

---

# GET /activity-logs/{id}

## Description

Menampilkan detail activity log.

---

### Success Response

```json
{
    "success": true,
    "data": {
        "id": 100,
        "user": "John Doe",
        "activity": "Create Booking",
        "description": "Booking HLV2026080001 berhasil dibuat.",
        "ip_address": "127.0.0.1",
        "created_at": "2026-08-10 14:30:00"
    }
}
```

---

# Business Rules

### ACTIVITY-001

Activity dibuat otomatis oleh sistem.

---

### ACTIVITY-002

Activity tidak dapat diubah.

---

### ACTIVITY-003

Activity tidak dapat dihapus.

---

### ACTIVITY-004

Setiap perubahan penting wajib dicatat.

Contoh:

- Login
- Logout
- Booking
- Payment
- Refund
- Warning
- Partner Approval
- Create Hotel
- Update Hotel
- Delete Hotel

---

### ACTIVITY-005

Activity menyimpan alamat IP pengguna.

---

### ACTIVITY-006

Super Admin dapat melihat seluruh aktivitas.

Admin Hotel hanya dapat melihat aktivitas hotel yang dikelolanya.

---

# Sequence Diagram

```text
Any Service
      │
      ▼
ActivityLogService
      │
      ▼
Save Activity
      │
      ▼
Database
```

---

# Arsitektur Laravel

```text
ActivityLogController
          │
          ▼
ActivityLogService
          │
          ▼
ActivityLogRepository
          │
          ▼
Database
```

---

# 17. Reporting API

## Overview

Reporting API digunakan untuk menghasilkan laporan operasional sistem H'Leven.

Laporan dapat difilter berdasarkan periode tertentu dan dapat diekspor menjadi PDF maupun Excel.

---

# Module Scope

Reporting terdiri dari:

- Booking Report
- Revenue Report
- Refund Report
- Hotel Report
- User Report
- Partner Report

---

# Access Permission

| Role | Permission |
|------|------------|
| User | ❌ |
| Admin Hotel | Report Hotel |
| Super Admin | All Report |

---

# Endpoint Summary

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /reports/bookings | Booking Report |
| GET | /reports/revenue | Revenue Report |
| GET | /reports/refunds | Refund Report |
| GET | /reports/users | User Report |
| GET | /reports/hotels | Hotel Report |
| GET | /reports/partners | Partner Report |
| GET | /reports/export | Export Report |

---

# Common Query Parameter

| Parameter | Description |
|-----------|-------------|
| start_date | Tanggal Awal |
| end_date | Tanggal Akhir |
| hotel_id | Hotel |
| status | Status |
| export | pdf / excel |

---

# Booking Report

### Response

```json
{
    "success": true,
    "data": {
        "total_booking": 850,
        "completed": 760,
        "cancelled": 30,
        "expired": 25,
        "pending": 35
    }
}
```

---

# Revenue Report

### Response

```json
{
    "success": true,
    "data": {
        "total_revenue": 350000000,
        "average_daily": 11500000,
        "average_monthly": 98000000
    }
}
```

---

# Refund Report

### Response

```json
{
    "success": true,
    "data": {
        "total_refund": 12,
        "refund_amount": 45000000
    }
}
```

---

# Hotel Report

### Response

```json
{
    "success": true,
    "data": {
        "total_hotels": 125,
        "active_hotels": 120,
        "inactive_hotels": 5
    }
}
```

---

# User Report

### Response

```json
{
    "success": true,
    "data": {
        "total_users": 1500,
        "verified_users": 1350,
        "new_users": 80
    }
}
```

---

# Partner Report

### Response

```json
{
    "success": true,
    "data": {
        "pending": 5,
        "approved": 90,
        "rejected": 6
    }
}
```

---

# GET /reports/export

## Description

Mengekspor laporan sesuai filter.

---

### Query Parameter

| Parameter | Description |
|-----------|-------------|
| type | booking, revenue, refund, hotel, partner |
| format | pdf, excel |

---

### Success Response

```json
{
    "success": true,
    "message": "Report berhasil dibuat.",
    "download_url": "/storage/reports/report-202608.pdf"
}
```

---

# Business Rules

### REPORT-001

Admin Hotel hanya dapat melihat laporan hotel miliknya.

---

### REPORT-002

Super Admin dapat melihat seluruh laporan.

---

### REPORT-003

Filter tanggal bersifat opsional.

---

### REPORT-004

Export mendukung PDF dan Excel.

---

### REPORT-005

Pendapatan dihitung dari pembayaran berstatus Success.

---

### REPORT-006

Refund dihitung dari refund berstatus Completed.

---

### REPORT-007

Semua laporan menggunakan timezone sistem.

---

# Sequence Diagram

```text
User
 │
 ▼
Request Report
 │
 ▼
ReportService
 │
 ├── BookingRepository
 ├── PaymentRepository
 ├── RefundRepository
 ├── HotelRepository
 └── UserRepository
 │
 ▼
Generate Report
 │
 ▼
Return JSON / File Export
```

---

# Arsitektur Laravel

```text
ReportController
        │
        ▼
ReportService
        │
        ├── BookingReportService
        ├── RevenueReportService
        ├── RefundReportService
        ├── UserReportService
        ├── HotelReportService
        └── ExportService
        │
        ▼
Database
```

# 18. Response Standard

## Overview

Seluruh endpoint API H'Leven wajib menggunakan format response yang konsisten.

Hal ini bertujuan untuk:

- Mempermudah integrasi Frontend.
- Mempermudah debugging.
- Menjaga konsistensi seluruh endpoint.
- Mengurangi kompleksitas pengembangan.

---

# Success Response

Semua request yang berhasil diproses menggunakan format berikut.

```json
{
    "success": true,
    "message": "Data berhasil diambil.",
    "data": {}
}
```

---

## Success Response (Collection)

```json
{
    "success": true,
    "message": "Data berhasil diambil.",
    "data": [],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 10,
        "total": 50
    }
}
```

---

## Success Response (Without Data)

Digunakan untuk:

- Delete
- Update
- Action

```json
{
    "success": true,
    "message": "Data berhasil diperbarui."
}
```

---

# Error Response

Semua error menggunakan format berikut.

```json
{
    "success": false,
    "message": "Data tidak ditemukan."
}
```

---

# Validation Error

```json
{
    "success": false,
    "message": "Validation Error.",
    "errors": {
        "email": [
            "Email wajib diisi."
        ],
        "password": [
            "Password minimal 8 karakter."
        ]
    }
}
```

---

# Unauthorized

```json
{
    "success": false,
    "message": "Unauthorized."
}
```

---

# Forbidden

```json
{
    "success": false,
    "message": "Forbidden."
}
```

---

# Not Found

```json
{
    "success": false,
    "message": "Resource tidak ditemukan."
}
```

---

# Internal Server Error

```json
{
    "success": false,
    "message": "Terjadi kesalahan pada server."
}
```

---

# Pagination Standard

```json
{
    "meta": {
        "current_page": 1,
        "last_page": 8,
        "per_page": 10,
        "total": 80
    }
}
```

---

# Naming Convention

## Endpoint

Gunakan format plural.

Contoh:

```
/users
/hotels
/bookings
/payments
/reviews
```

---

## HTTP Method

| Method | Description |
|---------|-------------|
| GET | Read |
| POST | Create |
| PUT | Update |
| PATCH | Partial Update |
| DELETE | Delete |

---

## JSON Field

Gunakan:

camelCase ❌

Gunakan:

snake_case ✅

Contoh:

```json
{
    "booking_code": "",
    "grand_total": "",
    "payment_status": ""
}
```

---

## Date Format

Gunakan:

```
YYYY-MM-DD
```

Contoh

```
2026-08-10
```

---

## Datetime Format

```
YYYY-MM-DD HH:mm:ss
```

Contoh

```
2026-08-10 14:30:00
```

---

# HTTP Status Code

| Status | Code |
|---------|-----:|
| Success | 200 |
| Created | 201 |
| No Content | 204 |
| Validation Error | 422 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not Found | 404 |
| Conflict | 409 |
| Server Error | 500 |

---

# API Version

Seluruh endpoint menggunakan prefix:

```
/api/v1
```

Contoh:

```
GET /api/v1/hotels

POST /api/v1/bookings

GET /api/v1/reviews
```

---

# Authentication

Menggunakan:

Laravel Sanctum

Header:

```
Authorization

Bearer {token}
```

---

# Content Type

```
application/json
```

Untuk upload file:

```
multipart/form-data
```

# 19. Error Standard

## Overview

Seluruh error pada sistem menggunakan kode dan pesan yang konsisten.

---

# Common Error

| HTTP Code | Message |
|-----------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# Authentication Error

| Message |
|----------|
| Invalid Email |
| Invalid Password |
| Account Suspended |
| Token Expired |
| Unauthorized |

---

# Booking Error

| Message |
|----------|
| Room Not Available |
| Invalid Check In Date |
| Invalid Check Out Date |
| Booking Already Cancelled |
| Booking Already Paid |

---

# Payment Error

| Message |
|----------|
| Payment Expired |
| Payment Failed |
| Invalid Signature |
| Invalid Callback |
| Transaction Not Found |

---

# Refund Error

| Message |
|----------|
| Refund Already Requested |
| Refund Not Allowed |
| Refund Already Completed |

---

# Hotel Error

| Message |
|----------|
| Hotel Not Found |
| Hotel Already Exists |

---

# Room Error

| Message |
|----------|
| Room Not Found |
| Room Stock Empty |

---

# Review Error

| Message |
|----------|
| Review Already Exists |
| Booking Not Completed |

---

# Partner Error

| Message |
|----------|
| Partner Already Registered |
| Document Not Complete |

---

# Warning Error

| Message |
|----------|
| Warning Not Found |

---

# Notification Error

| Message |
|----------|
| Notification Not Found |

---

# Activity Log Error

| Message |
|----------|
| Activity Not Found |

# 20. Endpoint Summary

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /login |
| POST | /register |
| POST | /logout |
| GET | /me |

---

## Hotel

| Method | Endpoint |
|---------|----------|
| GET | /hotels |
| GET | /hotels/{id} |
| POST | /hotels |
| PUT | /hotels/{id} |
| DELETE | /hotels/{id} |

---

## Room

| Method | Endpoint |
|---------|----------|
| GET | /rooms |
| GET | /rooms/{id} |
| POST | /rooms |
| PUT | /rooms/{id} |
| DELETE | /rooms/{id} |

---

## Facility

| Method | Endpoint |
|---------|----------|
| GET | /facilities |
| POST | /facilities |
| PUT | /facilities/{id} |
| DELETE | /facilities/{id} |

---

## Booking

| Method | Endpoint |
|---------|----------|
| GET | /bookings |
| GET | /bookings/{id} |
| POST | /bookings |
| PATCH | /bookings/{id}/cancel |

---

## Payment

| Method | Endpoint |
|---------|----------|
| GET | /payments/{id} |
| POST | /payments/{id}/snap-token |
| POST | /payments/callback |
| GET | /payments/{id}/status |

---

## Refund

| Method | Endpoint |
|---------|----------|
| GET | /refunds |
| POST | /refunds |
| PATCH | /refunds/{id}/approve |
| PATCH | /refunds/{id}/reject |

---

## Review

| Method | Endpoint |
|---------|----------|
| GET | /reviews |
| POST | /reviews |
| PUT | /reviews/{id} |
| DELETE | /reviews/{id} |

---

## Dashboard Admin

| Method | Endpoint |
|---------|----------|
| GET | /admin/dashboard |

---

## Dashboard Super Admin

| Method | Endpoint |
|---------|----------|
| GET | /super-admin/dashboard |

---

## Partner Application

| Method | Endpoint |
|---------|----------|
| GET | /partner-applications |
| POST | /partner-applications |
| PATCH | /partner-applications/{id}/approve |
| PATCH | /partner-applications/{id}/reject |

---

## Warning

| Method | Endpoint |
|---------|----------|
| GET | /warnings |
| POST | /warnings |
| PATCH | /warnings/{id}/status |
| DELETE | /warnings/{id} |

---

## Notification

| Method | Endpoint |
|---------|----------|
| GET | /notifications |
| PATCH | /notifications/{id}/read |
| PATCH | /notifications/read-all |
| DELETE | /notifications/{id} |

---

## Activity Log

| Method | Endpoint |
|---------|----------|
| GET | /activity-logs |
| GET | /activity-logs/{id} |

---

## Reporting

| Method | Endpoint |
|---------|----------|
| GET | /reports/bookings |
| GET | /reports/revenue |
| GET | /reports/refunds |
| GET | /reports/users |
| GET | /reports/hotels |
| GET | /reports/partners |
| GET | /reports/export |

---

# Total API Modules

| Module | Status |
|---------|--------|
| Authentication | ✅ |
| Hotel | ✅ |
| Room | ✅ |
| Facility | ✅ |
| Booking | ✅ |
| Payment | ✅ |
| Refund | ✅ |
| Review | ✅ |
| Dashboard Admin | ✅ |
| Dashboard Super Admin | ✅ |
| Partner Application | ✅ |
| Warning | ✅ |
| Notification | ✅ |
| Activity Log | ✅ |
| Reporting | ✅ |

---

# Documentation Status

**Version:** 1.0.0

**Framework:** Laravel 12

**Authentication:** Laravel Sanctum

**Payment Gateway:** Midtrans Snap

**Database:** MySQL

**API Style:** RESTful API

**Status:** Ready for Development 🚀

