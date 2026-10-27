<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BedTypeController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\FacilityController;
use App\Http\Controllers\Api\V1\HotelController;
use App\Http\Controllers\Api\V1\HotelPayoutController;
use App\Http\Controllers\Api\V1\HotelWalletController;
use App\Http\Controllers\Api\V1\ReportController as HotelReportController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\RoomCalendarController;
use App\Http\Controllers\Api\V1\RoomController;
use App\Http\Controllers\Api\V1\RoomTypeCategoryController;
use App\Http\Controllers\Api\V1\RoomTypeController;
use App\Http\Controllers\AppealController;
use App\Http\Controllers\FileStorageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PartnerApplicationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\SuperAdminPayoutController;
use App\Http\Controllers\SuperAdminUserController;
use App\Http\Controllers\PublicStatsController;
use App\Http\Controllers\WarningController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - H'Leven Backend
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // 1. PUBLIC ROUTES (Tanpa Token)
    // ==========================================
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/check-email', [PartnerApplicationController::class, 'checkEmail']);
    Route::get('/public-stats', [PublicStatsController::class, 'index']);
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::post('/payments/callback', [PaymentController::class, 'callback']);
    Route::get('/hotels', [HotelController::class, 'index']);
    Route::get('/hotels/{id}', [HotelController::class, 'show'])->whereNumber('id');

    // Route untuk user/publik mengecek daftar kamar & stok ketersediaan per tanggal
    Route::get('/hotels/{id}/rooms', [RoomController::class, 'index']);
    Route::get('/hotels/{id}/reviews', [ReviewController::class, 'publicIndex']);

    // Public booking (guest checkout — auto-creates a session token in controller)
    Route::post('/bookings/quote', [BookingController::class, 'quote']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/hotels/{id}/eligible-bookings', [ReviewController::class, 'eligibleBookings']);

    // ==========================================
    // 2. PROTECTED ROUTES (Butuh Token Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {

        // --- Profile & Auth ---
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/user/profile', [ProfileController::class, 'update']);
        Route::put('/user/change-password', [ProfileController::class, 'changePassword']);

        // --- Payment User ---
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::post('/payments/{id}/snap-token', [PaymentController::class, 'generateSnapToken']);
        Route::get('/payments/{id}/status', [PaymentController::class, 'status']);
        Route::post('/payments/{id}/mark-paid', [PaymentController::class, 'markPaid']);
        Route::post('/payments/{id}/sync', [PaymentController::class, 'sync']);

        // --- Booking User ---
        Route::middleware('role:user')->group(function () {
            Route::get('/user/bookings', [BookingController::class, 'userBookings']);
            Route::post('/user/bookings', [BookingController::class, 'store']);
            Route::post('/user/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);
            Route::get('/user/bookings/{id}/e-ticket', [BookingController::class, 'downloadETicket']);
        });

        // --- Reviews ---
        Route::post('/hotels/{id}/reviews', [ReviewController::class, 'store']);

        // --- Admin Hotel Management (legacy prefix, tetap dipakai frontend) ---
        Route::middleware(['role:admin_hotel', 'hotel_suspended'])->group(function () {
            // Profil Hotel Management
            Route::get('hotel/profile', [HotelController::class, 'showProfile']);
            Route::post('hotel/profile', [HotelController::class, 'update']);

            // --- Resource Kamar & Tipe Kamar ---
            Route::apiResource('hotel/rooms', RoomController::class);
            Route::apiResource('hotel/room-types', RoomTypeController::class);

            // --- Booking Management (Pelanggan) ---
            Route::get('hotel/bookings', [BookingController::class, 'index']);
            Route::get('hotel/bookings/{id}', [BookingController::class, 'show']);
            Route::patch('hotel/bookings/{id}/status', [BookingController::class, 'updateStatus']);

            // --- Laporan & Pembayaran ---
            Route::get('hotel/reports/revenue', [HotelReportController::class, 'revenueReport']);
            Route::get('hotel/payments', [PaymentController::class, 'hotelPayments']);
            Route::post('hotel/payments/{orderId}/check-status', [PaymentController::class, 'syncStatus']);

            // --- Ulasan ---
            Route::get('hotel/reviews', [ReviewController::class, 'index']);
            Route::post('hotel/reviews/{id}/reply', [ReviewController::class, 'reply']);
        });
    });
});

// ==========================================
// 3. ADMIN HOTEL ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin_hotel'])->prefix('v1/admin')->group(function () {
    Route::get('/appeals', [AppealController::class, 'indexAdmin']);
    Route::post('/appeals', [AppealController::class, 'storeAdmin']);
    Route::get('/warnings', [WarningController::class, 'index']);
    Route::get('/warnings/{id}', [WarningController::class, 'show']);
    Route::patch('/warnings/{id}/read', [WarningController::class, 'markAsRead']);
});

Route::middleware(['auth:sanctum', 'role:admin_hotel', 'hotel_suspended'])->prefix('v1/admin')->group(function () {

    // --- Wallet / Saldo Hotel ---
    Route::get('/wallet', [HotelWalletController::class, 'summary']);
    Route::get('/wallet/destinations', [HotelWalletController::class, 'destinations']);
    Route::post('/wallet/destinations', [HotelWalletController::class, 'storeDestination']);
    Route::put('/wallet/destinations/{id}', [HotelWalletController::class, 'updateDestination'])->whereNumber('id');
    Route::delete('/wallet/destinations/{id}', [HotelWalletController::class, 'deleteDestination'])->whereNumber('id');
    Route::get('/wallet/withdrawals', [HotelWalletController::class, 'withdrawals']);
    Route::post('/wallet/withdrawals', [HotelWalletController::class, 'requestWithdrawal']);

    // --- Dashboard Admin Hotel ---
    Route::get('/dashboard-stats', function () {
        return response()->json([
            'success' => true,
            'message' => 'Selamat datang di Dashboard Admin Hotel',
        ]);
    });
    Route::get('/hotel/dashboard', [DashboardController::class, 'index']);
    Route::post('/verify-qr', [QRCodeController::class, 'verify']);

    // --- Profil Hotel Admin ---
    Route::get('/hotel/profile', [HotelController::class, 'showProfile']);
    Route::post('/hotel/profile', [HotelController::class, 'update']);
    Route::post('/hotel/profile/logo', [HotelController::class, 'uploadLogo']);
    Route::delete('/hotel/profile/logo', [HotelController::class, 'deleteLogo']);
    Route::get('/hotels', [HotelController::class, 'myHotels']);
    Route::put('/hotels/{id}', [HotelController::class, 'update']);
    Route::post('/hotels/{id}/photos', [HotelController::class, 'uploadPhoto']);

    // Support delete photo dengan 1 parameter (id photo) maupun 2 parameter (id hotel & photo)
    Route::delete('/hotels/photos/{photoId}', [HotelController::class, 'deletePhoto']);
    Route::delete('/hotels/{hotelId}/photos/{photoId}', [HotelController::class, 'deletePhoto']);

    // --- CRUD Kamar ---
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::post('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

    // --- Kalender Ketersediaan & Harga per Tanggal ---
    Route::get('/rooms/{id}/calendar', [RoomCalendarController::class, 'show']);
    Route::put('/rooms/{id}/calendar', [RoomCalendarController::class, 'update']);

    // --- Management Tipe Kamar (RoomTypeController) ---
    Route::get('/hotels/{hotelId}/room-types', [RoomTypeController::class, 'index']);
    Route::post('/hotels/{hotelId}/room-types', [RoomTypeController::class, 'store']);
    Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
    Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);

    // --- Master Tipe Kamar (kategori yang dipilih saat membuat kamar) ---
    Route::get('/room-type-categories', [RoomTypeCategoryController::class, 'index']);
    Route::post('/room-type-categories', [RoomTypeCategoryController::class, 'store']);
    Route::get('/room-type-categories/{id}', [RoomTypeCategoryController::class, 'show']);
    Route::put('/room-type-categories/{id}', [RoomTypeCategoryController::class, 'update']);
    Route::delete('/room-type-categories/{id}', [RoomTypeCategoryController::class, 'destroy']);

    // --- CRUD Bed Types (admin hotel) ---
    Route::get('/bed-types', [BedTypeController::class, 'index']);
    Route::apiResource('bed-types', BedTypeController::class)->except(['index']);

    // --- Booking Admin ---
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings/manual', [BookingController::class, 'storeManual']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::post('/bookings/{id}/refund-approval', [BookingController::class, 'handleRefundApproval']);
    Route::post('/bookings/{id}/extend', [BookingController::class, 'extendBooking']);

    // --- Pencairan Dana (Payout) ---
    Route::get('/payouts', [HotelPayoutController::class, 'index']);
    Route::post('/payouts', [HotelPayoutController::class, 'store']);
    Route::get('/payouts/{id}/invoice', [HotelPayoutController::class, 'invoice']);
});

// ==========================================
// 4. SUPER ADMIN ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('v1/super-admin')->group(function () {

    Route::prefix('dashboard')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'summary']);
        Route::get('/recent-activities', [SuperAdminDashboardController::class, 'recentActivities']);
        Route::get('/bookings', [SuperAdminDashboardController::class, 'bookings']);
        Route::get('/payments', [SuperAdminDashboardController::class, 'payments']);
        Route::get('/refunds', [SuperAdminDashboardController::class, 'refunds']);
        Route::get('/revenue', [SuperAdminDashboardController::class, 'revenue']);
        Route::get('/hotel-commission', [SuperAdminDashboardController::class, 'hotelCommission']);
        Route::get('/charts', [SuperAdminDashboardController::class, 'charts']);
        Route::get('/hotel-health', [SuperAdminDashboardController::class, 'hotelHealthReport']);
    });

    Route::get('/wallet', [SuperAdminDashboardController::class, 'wallet']);

    Route::prefix('users')->group(function () {
        Route::get('/', [SuperAdminUserController::class, 'index']);
        Route::get('/{id}', [SuperAdminUserController::class, 'show']);
        Route::post('/', [SuperAdminUserController::class, 'store']);
        Route::patch('/{id}/status', [SuperAdminUserController::class, 'updateStatus']);
        Route::patch('/{id}/role', [SuperAdminUserController::class, 'updateRole']);
        Route::delete('/{id}', [SuperAdminUserController::class, 'destroy']);
    });

    Route::prefix('hotels')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'hotels']);
        Route::patch('/{id}/status', [SuperAdminDashboardController::class, 'updateHotelStatus']);
        Route::patch('/{id}/star', [SuperAdminDashboardController::class, 'updateHotelStar']);
        Route::delete('/{id}', [SuperAdminDashboardController::class, 'destroyHotel']);
    });

    Route::prefix('warnings')->group(function () {
        Route::get('/', [WarningController::class, 'index']);
        Route::get('/{id}', [WarningController::class, 'show']);
        Route::post('/', [WarningController::class, 'store']);
        Route::patch('/{id}/status', [WarningController::class, 'updateStatus']);
        Route::delete('/{id}', [WarningController::class, 'destroy']);
    });

    Route::prefix('appeals')->group(function () {
        Route::get('/', [AppealController::class, 'indexSuperAdmin']);
        Route::patch('/{id}/status', [AppealController::class, 'updateStatus']);
    });

    Route::prefix('payouts')->group(function () {
        Route::get('/', [SuperAdminPayoutController::class, 'index']);
        Route::patch('/{id}/status', [SuperAdminPayoutController::class, 'updateStatus']);
    });

    // --- Partner Application (Super Admin) ---
    Route::prefix('partners')->group(function () {
        Route::get('/', [PartnerApplicationController::class, 'index']);
        Route::get('/{id}/documents/{docId}', [PartnerApplicationController::class, 'document']);
        Route::patch('/{id}/approve', [PartnerApplicationController::class, 'approve']);
        Route::patch('/{id}/reject', [PartnerApplicationController::class, 'reject']);
    });
});

// ==========================================
// 5. SHARED ROUTES
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

Route::middleware(['auth:sanctum'])->prefix('v1/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/{id}', [NotificationController::class, 'show']);
    Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:admin_hotel'])->prefix('v1')->group(function () {
    Route::post('/hotels/{id}/photos', [FileStorageController::class, 'uploadHotelPhoto']);
    Route::delete('/hotel-photos/{id}', [FileStorageController::class, 'deleteHotelPhoto']);
    Route::post('/rooms/{id}/photos', [FileStorageController::class, 'uploadRoomPhoto']);
    Route::delete('/room-photos/{id}', [FileStorageController::class, 'deleteRoomPhoto']);
});
