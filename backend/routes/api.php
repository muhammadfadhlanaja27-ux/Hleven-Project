<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FacilityController;
use App\Http\Controllers\Api\V1\HotelController;
use App\Http\Controllers\Api\V1\RoomTypeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\WarningController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuperAdminUserController;
use App\Http\Controllers\FileStorageController;

/*
|--------------------------------------------------------------------------
| API Routes - H'Leven Backend
|--------------------------------------------------------------------------
 */

// H'Leven Backend v1 Routes
Route::prefix('v1')->group(function () {
    // Public Auth Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public Facility Routes
    Route::get('/facilities', [FacilityController::class, 'index']);

    // Rute Webhook Midtrans (Public, tidak butuh auth)
    Route::post('/payments/callback', [PaymentController::class, 'callback']);

    // Protected Routes (Membutuhkan Token Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // Profile & Auth Management
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::put('/user/profile', [App\Http\Controllers\Api\ProfileController::class, 'update']);
        // Untuk ganti password
        Route::put('/user/change-password', [App\Http\Controllers\Api\ProfileController::class, 'changePassword']);
        Route::post('/logout', [AuthController::class, 'logout']);
        

        // Protected Facility Routes (Hanya untuk Super Admin & Admin Hotel)
        Route::middleware('role:super_admin,admin_hotel')->group(function () {
            Route::post('/facilities', [FacilityController::class, 'store']);
            Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);
        });

        // Rute untuk User (Dilindungi Sanctum & Role User)
        Route::middleware('role:user')->prefix('payments')->group(function () {
            Route::get('/{id}', [PaymentController::class, 'show']);
            Route::post('/{id}/snap-token', [PaymentController::class, 'generateSnapToken']);
            Route::get('/{id}/status', [PaymentController::class, 'status']);
        });

        // Rute khusus Admin Hotel (Menggunakan middleware 'role')
        Route::middleware('role:admin_hotel,super_admin')->group(function () {
            Route::get('/admin/dashboard-stats', function () {
                return response()->json(['message' => 'Selamat datang di Dashboard Admin Hotel']);
            });
        });
    });
});

// Grup Middleware Admin Hotel (auth:sanctum & v1/admin)
Route::middleware(['auth:sanctum', 'role:admin_hotel'])->prefix('v1/admin')->group(function () {
    Route::post('/verify-qr', [\App\Http\Controllers\QRCodeController::class, 'verify']);

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
});

// Route Super Admin Dashboard
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('v1/super-admin/dashboard')->group(function () {
    Route::get('/', [SuperAdminDashboardController::class, 'summary']);
    Route::get('/bookings', [SuperAdminDashboardController::class, 'bookings']);
    Route::get('/payments', [SuperAdminDashboardController::class, 'payments']);
    Route::get('/refunds', [SuperAdminDashboardController::class, 'refunds']);
    Route::get('/revenue', [SuperAdminDashboardController::class, 'revenue']);
    Route::get('/users', [SuperAdminDashboardController::class, 'users']);
    Route::get('/hotels', [SuperAdminDashboardController::class, 'hotels']);
    Route::get('/partners', [SuperAdminDashboardController::class, 'partners']);
    Route::get('/charts', [SuperAdminDashboardController::class, 'charts']);
    Route::get('/recent-activities', [SuperAdminDashboardController::class, 'recentActivities']);
});

// Route Warning
Route::middleware(['auth:sanctum'])->prefix('v1/warnings')->group(function () {
    // Endpoint yang bisa diakses Admin Hotel dan Super Admin
    Route::get('/', [WarningController::class, 'index']);
    Route::get('/{id}', [WarningController::class, 'show']);

    // Endpoint khusus Super Admin
    Route::middleware('role:super_admin')->group(function () {
        Route::post('/', [WarningController::class, 'store']);
        Route::patch('/{id}/status', [WarningController::class, 'updateStatus']);
        Route::delete('/{id}', [WarningController::class, 'destroy']);
    });
});

// Route Notification
Route::middleware(['auth:sanctum'])->prefix('v1/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/{id}', [NotificationController::class, 'show']);
    Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
});


// Hanya bisa diakses oleh Admin Hotel dan Super Admin
Route::middleware(['auth:sanctum', 'role:admin_hotel,super_admin'])->prefix('v1/activity-logs')->group(function () {
    Route::get('/', [ActivityLogController::class, 'index']);
    Route::get('/{id}', [ActivityLogController::class, 'show']);
});

// Rute untuk laporan (Reports) - Hanya bisa diakses oleh Admin Hotel dan Super Admin
Route::middleware(['auth:sanctum', 'role:admin_hotel,super_admin'])->prefix('v1/reports')->group(function () {
    Route::get('/bookings', [ReportController::class, 'bookings']);
    Route::get('/revenue', [ReportController::class, 'revenue']);
    Route::get('/refunds', [ReportController::class, 'refunds']);
    Route::get('/export', [ReportController::class, 'export']);

    // Laporan spesifik platform, idealnya dibatasi untuk Super Admin
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/users', [ReportController::class, 'users']);
        Route::get('/hotels', [ReportController::class, 'hotels']);
        Route::get('/partners', [ReportController::class, 'partners']);
    });
});

// Rute untuk manajemen Admin Hotel oleh Super Admin
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('v1/super-admin/users')->group(function () {
    Route::get('/', [SuperAdminUserController::class, 'index']);
    Route::get('/{id}', [SuperAdminUserController::class, 'show']);
    Route::post('/', [SuperAdminUserController::class, 'store']); // Untuk membuat Admin Hotel baru
    Route::patch('/{id}/status', [SuperAdminUserController::class, 'updateStatus']); // Untuk Suspend/Activate
    Route::delete('/{id}', [SuperAdminUserController::class, 'destroy']);
});

// Rute untuk manajemen file (Upload Avatar, Foto Hotel, Foto Kamar)
Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Endpoint untuk User & Admin (Upload Avatar)
    Route::post('/users/{id}/avatar', [FileStorageController::class, 'uploadAvatar']);

    // Endpoint khusus Admin Hotel untuk mengelola foto hotel dan kamar
    Route::middleware('role:admin_hotel')->group(function () {
        Route::post('/hotels/{id}/photos', [FileStorageController::class, 'uploadHotelPhoto']);
        Route::delete('/hotel-photos/{id}', [FileStorageController::class, 'deleteHotelPhoto']);

        Route::post('/rooms/{id}/photos', [FileStorageController::class, 'uploadRoomPhoto']);
        Route::delete('/room-photos/{id}', [FileStorageController::class, 'deleteRoomPhoto']);
    });
});
