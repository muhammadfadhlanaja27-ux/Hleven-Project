<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

// Rute untuk User (Dilindungi Sanctum)
Route::middleware(['auth:sanctum', 'role:user'])->prefix('v1/payments')->group(function () {
    Route::get('/{id}', [PaymentController::class, 'show']);
    Route::post('/{id}/snap-token', [PaymentController::class, 'generateSnapToken']);
    Route::get('/{id}/status', [PaymentController::class, 'status']);
});

// Rute Webhook Midtrans (Public, tidak butuh auth)
Route::post('v1/payments/callback', [PaymentController::class, 'callback']);

