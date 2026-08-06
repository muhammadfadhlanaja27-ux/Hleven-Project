<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\PaymentController;

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

    // Rute Webhook Midtrans (Public, tidak butuh auth)
    Route::post('/payments/callback', [PaymentController::class, 'callback']);

    // Protected Routes (Membutuhkan Token Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Profile & Auth Management
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/logout', [AuthController::class, 'logout']);

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
