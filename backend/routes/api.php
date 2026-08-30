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
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\WarningController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SuperAdminUserController;
use App\Http\Controllers\FileStorageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\QRCodeController;
use App\Http\Controllers\PartnerApplicationController;

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
    Route::get('/check-email', [PartnerApplicationController::class, 'checkEmail']);
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::post('/payments/callback', [PaymentController::class, 'callback']);
    Route::get('/hotels', [HotelController::class, 'index']);
    Route::get('/hotels/{id}', [HotelController::class, 'show'])->whereNumber('id');
    
    // Route untuk user/publik mengecek daftar kamar & stok ketersediaan per tanggal
    Route::get('/hotels/{id}/rooms', [RoomController::class, 'index']);

    // ==========================================
    // 2. PROTECTED ROUTES (Butuh Token Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {

        // --- Profile & Auth ---
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/user/profile', [ProfileController::class, 'update']);
        Route::put('/user/change-password', [ProfileController::class, 'changePassword']);

        // --- Profil Hotel Management ---
        Route::get('hotel/profile', [HotelController::class, 'showProfile']);
        Route::post('hotel/profile', [HotelController::class, 'update']);

        // --- Resource Kamar & Tipe Kamar ---
        Route::apiResource('hotel/rooms', RoomController::class);
        Route::apiResource('hotel/room-types', RoomTypeController::class);

        // --- Booking Management (Pelanggan) ---
        Route::get('hotel/bookings', [BookingController::class, 'index']);
        Route::get('hotel/bookings/{id}', [BookingController::class, 'show']);
        Route::patch('hotel/bookings/{id}/status', [BookingController::class, 'updateStatus']);

        // --- Laporan & Staf ---
        Route::get('hotel/reports/revenue', [ReportController::class, 'revenueReport']);
        Route::get('hotel/staffs', [StaffController::class, 'index']);
        Route::post('hotel/staffs', [StaffController::class, 'store']);
        Route::delete('hotel/staffs/{id}', [StaffController::class, 'destroy']);

        // --- Ulasan ---
        Route::get('hotel/reviews', [ReviewController::class, 'index']);
        Route::post('hotel/reviews/{id}/reply', [ReviewController::class, 'reply']);
        Route::delete('hotel/reviews/{id}', [ReviewController::class, 'destroy']);

        // --- Fasilitas (Admin/Super Admin) ---
        Route::middleware('role:super_admin,admin_hotel')->group(function () {
            Route::post('/facilities', [FacilityController::class, 'store']);
            Route::put('/facilities/{id}', [FacilityController::class, 'update']);
            Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);
        });

        // --- Booking & Partner Application User ---
        Route::middleware('role:user')->group(function () {
            Route::get('/user/bookings', [BookingController::class, 'userBookings']);
            Route::post('/user/bookings', [BookingController::class, 'store']);
            Route::post('/user/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);
            Route::get('/user/bookings/{id}/e-ticket', [BookingController::class, 'downloadETicket']); // Download E-Tiket PDF
            Route::post('/bookings', [BookingController::class, 'store']);
            
            // Route Pengajuan Partner User (DITAMBAHKAN)
            Route::get('/user/partner-application', [PartnerApplicationController::class, 'getUserApplication']);
        });

        // --- Pembayaran User ---
        Route::middleware('role:user')->prefix('payments')->group(function () {
            Route::get('/{id}', [PaymentController::class, 'show']);
            Route::post('/{id}/snap-token', [PaymentController::class, 'generateSnapToken']);
            Route::get('/{id}/status', [PaymentController::class, 'status']);
        });

        // --- File Storage ---
        Route::post('/users/{id}/avatar', [FileStorageController::class, 'uploadAvatar']);

        // --- Partner Application (User) ---
        Route::post('/partner-applications', [PartnerApplicationController::class, 'store']);
        Route::get('/user/partner-application', [PartnerApplicationController::class, 'getUserApplication']);
    });
});

// ==========================================
// 3. ADMIN HOTEL ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin_hotel'])->prefix('v1/admin')->group(function () {

    // --- Dashboard Admin Hotel ---
    Route::get('/dashboard-stats', function () {
        return response()->json([
            'success' => true,
            'message' => 'Selamat datang di Dashboard Admin Hotel'
        ]);
    });
    Route::get('/hotel/dashboard', [DashboardController::class, 'index']);
    Route::post('/verify-qr', [QRCodeController::class, 'verify']);

    // --- Profil Hotel Admin ---
    Route::get('/hotel/profile', [HotelController::class, 'showProfile']);
    Route::post('/hotel/profile', [HotelController::class, 'update']);
    Route::get('/hotels', [HotelController::class, 'myHotels']);
    Route::put('/hotels/{id}', [HotelController::class, 'update']);
    Route::post('/hotels/{id}/photos', [HotelController::class, 'uploadPhoto']);
    Route::delete('/hotels/{hotelId}/photos/{photoId}', [HotelController::class, 'deletePhoto']);

    // --- Management Kamar (RoomController) ---
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

    // --- Management Tipe Kamar (RoomTypeController) ---
    Route::get('/hotels/{hotelId}/room-types', [RoomTypeController::class, 'index']);
    Route::post('/hotels/{hotelId}/room-types', [RoomTypeController::class, 'store']);
    Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
    Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);

    // --- Booking Admin ---
    Route::get('/bookings', [BookingController::class, 'index']); 
    Route::get('/bookings/{id}', [BookingController::class, 'show']); 
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']); 
    Route::post('/bookings/{id}/refund-approval', [BookingController::class, 'handleRefundApproval']); // Persetujuan/Penolakan Refund Admin
});

// ==========================================
// 4. SUPER ADMIN ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('v1/super-admin')->group(function () {

    Route::prefix('dashboard')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'summary']);
        Route::get('/bookings', [SuperAdminDashboardController::class, 'bookings']);
        Route::get('/payments', [SuperAdminDashboardController::class, 'payments']);
        Route::get('/refunds', [SuperAdminDashboardController::class, 'refunds']);
        Route::get('/revenue', [SuperAdminDashboardController::class, 'revenue']);
        Route::get('/charts', [SuperAdminDashboardController::class, 'charts']);
        Route::get('/recent-activities', [SuperAdminDashboardController::class, 'recentActivities']);
    });

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
    });

    Route::prefix('partners')->group(function () {
        Route::get('/stats', [SuperAdminDashboardController::class, 'partners']);
        Route::get('/', [PartnerApplicationController::class, 'index']);
        Route::patch('/{id}/approve', [PartnerApplicationController::class, 'approve']);
        Route::patch('/{id}/reject', [PartnerApplicationController::class, 'reject']);
    });

    Route::prefix('warnings')->group(function () {
        Route::get('/', [WarningController::class, 'index']);
        Route::get('/{id}', [WarningController::class, 'show']);
        Route::post('/', [WarningController::class, 'store']);
        Route::patch('/{id}/status', [WarningController::class, 'updateStatus']);
        Route::delete('/{id}', [WarningController::class, 'destroy']);
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