<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\WarningController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuperAdminUserController;
/*
|--------------------------------------------------------------------------
| API Routes - H'Leven Backend
|--------------------------------------------------------------------------
*/

// Rute Bawaan / User Profile lama
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// H'Leven Backend v1 Routes
Route::prefix('v1')->group(function () {

    // Public Auth Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected Routes (Membutuhkan Token Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Rute untuk User (Dilindungi Sanctum)
        Route::middleware(['auth:sanctum', 'role:user'])->prefix('v1/payments')->group(function () {
            Route::get('/{id}', [PaymentController::class, 'show']);
            Route::post('/{id}/snap-token', [PaymentController::class, 'generateSnapToken']);
            Route::get('/{id}/status', [PaymentController::class, 'status']);
        });

        // Rute Webhook Midtrans (Public, tidak butuh auth)
        Route::post('v1/payments/callback', [PaymentController::class, 'callback']);

        // Rute khusus Admin Hotel (Menggunakan middleware 'role')
        Route::middleware('role:admin_hotel,super_admin')->group(function () {
            Route::get('/admin/dashboard-stats', function () {
                return response()->json(['message' => 'Selamat datang di Dashboard Admin Hotel']);
            });
        });
    });
});

// Di dalam grup middleware Admin Hotel
Route::middleware(['auth:sanctum', 'role:admin_hotel'])->prefix('v1/admin')->group(function () {
    Route::post('/verify-qr', [\App\Http\Controllers\QRCodeController::class, 'verify']);
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
    Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']); // Letakkan di atas /{id}
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
