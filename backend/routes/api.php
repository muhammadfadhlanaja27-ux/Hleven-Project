<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FacilityController;
use App\Http\Controllers\Api\V1\HotelController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\RoomTypeController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\RoomController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\StaffController; // Impor ditambahkan di sini
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\WarningController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SuperAdminUserController;
use App\Http\Controllers\FileStorageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\QRCodeController;

/*
|--------------------------------------------------------------------------
| API Routes - H'Leven Backend
|--------------------------------------------------------------------------
*/

// H'Leven Backend v1 Routes
Route::prefix('v1')->group(function () {

    // ==========================================
    // 1. PUBLIC ROUTES (Tidak butuh token)
    // ==========================================
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::post('/payments/callback', [PaymentController::class, 'callback']); // Webhook Midtrans
    Route::get('/hotels', [HotelController::class, 'index']);
    Route::get('/hotels/{id}', [HotelController::class, 'show']);

    // ==========================================
    // 2. PROTECTED ROUTES (Butuh Token Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {

        // --- Profile & Auth Management ---
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Menggunakan ProfileController untuk update data user
        Route::put('/user/profile', [ProfileController::class, 'update']);
        Route::put('/user/change-password', [ProfileController::class, 'changePassword']);

        // --- Profil Hotel Management ---
        Route::get('hotel/profile', [HotelController::class, 'show']);
        Route::post('hotel/profile', [HotelController::class, 'update']); // Gunakan POST dengan form-data + _method=PUT jika mengunggah gambar/logo

        // --- Resource Kamar (RoomController) ---
        Route::apiResource('hotel/rooms', RoomController::class);

        // --- Resource Tipe Kamar (RoomTypeController) ---
        Route::apiResource('hotel/room-types', RoomTypeController::class);

        // --- Booking Management (User / Pelanggan) ---
        Route::get('hotel/bookings', [BookingController::class, 'index']);
        Route::get('hotel/bookings/{id}', [BookingController::class, 'show']);
        Route::patch('hotel/bookings/{id}/status', [BookingController::class, 'updateStatus']);

        // --- Laporan Hotel (User / Partner) ---
        Route::get('hotel/reports/revenue', [ReportController::class, 'revenueReport']);

        // --- Manajemen Staf Hotel ---
        Route::get('hotel/staffs', [StaffController::class, 'index']);
        Route::post('hotel/staffs', [StaffController::class, 'store']);
        Route::delete('hotel/staffs/{id}', [StaffController::class, 'destroy']);

        // --- Fasilitas (Hanya Super Admin & Admin Hotel) ---
        Route::middleware('role:super_admin,admin_hotel')->group(function () {
            Route::post('/facilities', [FacilityController::class, 'store']);
            Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);
        });

        // --- Rute Pembayaran User ---
        Route::middleware('role:user')->prefix('payments')->group(function () {
            Route::get('/{id}', [PaymentController::class, 'show']);
            Route::post('/{id}/snap-token', [PaymentController::class, 'generateSnapToken']);
            Route::get('/{id}/status', [PaymentController::class, 'status']);
        });

        // --- File Storage (Avatar) ---
        Route::post('/users/{id}/avatar', [FileStorageController::class, 'uploadAvatar']);
    });
});

// ==========================================
// 3. ADMIN HOTEL ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin_hotel'])->prefix('v1/admin')->group(function () {
    
    // Endpoint Statistik Dashboard Admin Hotel
    Route::get('/dashboard-stats', function () {
        return response()->json([
            'success' => true,
            'message' => 'Selamat datang di Dashboard Admin Hotel'
        ]);
    });

    // Dashboard Admin Hotel via DashboardController
    Route::get('/hotel/dashboard', [DashboardController::class, 'index']);

    Route::post('/verify-qr', [QRCodeController::class, 'verify']);

    // Hotel Admin Routes
    Route::get('/hotels', [HotelController::class, 'myHotels']);
    Route::put('/hotels/{id}', [HotelController::class, 'update']);
    Route::post('/hotels/{id}/photos', [HotelController::class, 'uploadPhoto']);
    Route::delete('/hotels/{hotelId}/photos/{photoId}', [HotelController::class, 'deletePhoto']);

    // Room Type Admin Routes
    Route::get('/hotels/{hotelId}/rooms', [RoomTypeController::class, 'index']);
    Route::post('/hotels/{hotelId}/rooms', [RoomTypeController::class, 'store']);
    Route::put('/rooms/{id}', [RoomTypeController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomTypeController::class, 'destroy']);

    // Booking Admin Routes (Disesuaikan dengan indexAdmin)
    Route::get('/bookings', [BookingController::class, 'indexAdmin']); 
    Route::get('/bookings/{id}', [BookingController::class, 'show']); 
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']); 
});

// ==========================================
// 4. SUPER ADMIN ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('v1/super-admin')->group(function () {

    // --- Dashboard Analytics ---
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'summary']);
        Route::get('/bookings', [SuperAdminDashboardController::class, 'bookings']);
        Route::get('/payments', [SuperAdminDashboardController::class, 'payments']);
        Route::get('/refunds', [SuperAdminDashboardController::class, 'refunds']);
        Route::get('/revenue', [SuperAdminDashboardController::class, 'revenue']);
        Route::get('/charts', [SuperAdminDashboardController::class, 'charts']);
        Route::get('/recent-activities', [SuperAdminDashboardController::class, 'recentActivities']);
    });

    // --- User Management ---
    Route::prefix('users')->group(function () {
        Route::get('/', [SuperAdminUserController::class, 'index']);
        Route::get('/{id}', [SuperAdminUserController::class, 'show']);
        Route::post('/', [SuperAdminUserController::class, 'store']);
        Route::patch('/{id}/status', [SuperAdminUserController::class, 'updateStatus']);
        Route::delete('/{id}', [SuperAdminUserController::class, 'destroy']);
    });

    // --- Hotel Monitoring ---
    Route::prefix('hotels')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'hotels']);
        Route::patch('/{id}/status', [SuperAdminDashboardController::class, 'updateHotelStatus']);
    });

    // --- Partner Approval ---
    Route::prefix('partners')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'partners']);
        Route::patch('/{id}/status', [SuperAdminDashboardController::class, 'updatePartnerStatus']);
    });

    // --- Warning Management ---
    Route::prefix('warnings')->group(function () {
        Route::get('/', [WarningController::class, 'index']);
        Route::get('/{id}', [WarningController::class, 'show']);
        Route::post('/', [WarningController::class, 'store']);
        Route::patch('/{id}/status', [WarningController::class, 'updateStatus']);
        Route::delete('/{id}', [WarningController::class, 'destroy']);
    });
});

// ==========================================
// 5. SHARED ROUTES (Admin Hotel & Super Admin)
// ==========================================

Route::middleware(['auth:sanctum', 'role:admin_hotel,super_admin'])->prefix('v1/activity-logs')->group(function () {
    Route::get('/', [ActivityLogController::class, 'index']);
    Route::get('/{id}', [ActivityLogController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:admin_hotel,super_admin'])->prefix('v1/reports')->group(function () {
    Route::get('/bookings', [ReportController::class, 'bookings']);
    Route::get('/revenue', [ReportController::class, 'revenue']);
    Route::get('/refunds', [ReportController::class, 'refunds']);
    Route::get('/export', [ReportController::class, 'export']);

    Route::middleware('role:super_admin')->group(function () {
        Route::get('/users', [ReportController::class, 'users']);
        Route::get('/hotels', [ReportController::class, 'hotels']);
    });
});
