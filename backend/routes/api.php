<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\PaymentController;
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