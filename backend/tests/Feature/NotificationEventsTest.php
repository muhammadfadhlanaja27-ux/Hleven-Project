<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\User;
use App\Services\MidtransService;
use App\Services\SuperAdminDashboardService;
use App\Services\SuperAdminUserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class NotificationEventsTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_purchase_notifies_customer_and_hotel_once(): void
    {
        $customer = $this->createUser('customer@example.com', 'user');
        $hotelAdmin = $this->createUser('hotel@example.com', 'admin_hotel');
        $hotel = $this->createHotel($hotelAdmin);
        $booking = Booking::create([
            'booking_code' => 'HLVN-PURCHASE-001',
            'user_id' => $customer->id,
            'hotel_id' => $hotel->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'total_night' => 1,
            'subtotal' => 400000,
            'tax' => 20000,
            'grand_total' => 420000,
            'status' => 'unpaid',
        ]);
        Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'pending',
            'gross_amount' => 420000,
            'order_id' => $booking->booking_code,
        ]);

        $serverKey = 'notification-test-server-key';
        Config::set('midtrans.serverKey', $serverKey);
        $service = app(MidtransService::class);
        $payload = [
            'order_id' => $booking->booking_code,
            'status_code' => '200',
            'gross_amount' => '420000.00',
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
            'transaction_id' => 'TRX-PURCHASE-001',
        ];
        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].$serverKey
        );

        $service->handleCallback($payload);
        $service->handleCallback($payload);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'title' => 'Pembayaran Berhasil',
            'type' => 'purchase',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $hotelAdmin->id,
            'title' => 'Booking Baru Dibayar',
            'type' => 'purchase',
        ]);
        $this->assertSame(2, Notification::where('type', 'purchase')->count());
        $this->assertDatabaseHas('e_tickets', ['booking_id' => $booking->id]);
        $this->assertDatabaseCount('activity_logs', 2);
    }

    public function test_manual_payment_confirmation_notifies_customer_and_hotel(): void
    {
        $customer = $this->createUser('manual-customer@example.com', 'user');
        $hotelAdmin = $this->createUser('manual-hotel@example.com', 'admin_hotel');
        $hotel = $this->createHotel($hotelAdmin);
        $booking = Booking::create([
            'booking_code' => 'HLVN-MANUAL-PURCHASE-001',
            'user_id' => $customer->id,
            'hotel_id' => $hotel->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'total_night' => 1,
            'subtotal' => 400000,
            'tax' => 20000,
            'grand_total' => 420000,
            'status' => 'unpaid',
        ]);
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'pending',
            'gross_amount' => 420000,
            'order_id' => $booking->booking_code,
        ]);
        $this->actingAs($customer, 'sanctum');

        $this->postJson("/api/v1/payments/{$payment->id}/mark-paid")
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'success');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'purchase',
            'title' => 'Pembayaran Berhasil',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $hotelAdmin->id,
            'type' => 'purchase',
            'title' => 'Booking Baru Dibayar',
        ]);
    }

    public function test_hotel_suspension_notifies_hotel_admin_only_when_status_changes(): void
    {
        $hotelAdmin = $this->createUser('hotel-status@example.com', 'admin_hotel');
        $hotel = $this->createHotel($hotelAdmin);
        $service = app(SuperAdminDashboardService::class);

        $service->updateHotelStatus($hotel, 'blocked');
        $service->updateHotelStatus($hotel->fresh(), 'blocked');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $hotelAdmin->id,
            'title' => 'Hotel Ditangguhkan',
            'type' => 'suspend',
        ]);
        $this->assertSame(1, Notification::where('type', 'suspend')->count());
    }

    public function test_user_suspension_notifies_user_only_when_status_changes(): void
    {
        $user = $this->createUser('suspended@example.com', 'user');
        $superAdmin = $this->createUser('superadmin@example.com', 'super_admin');
        $service = app(SuperAdminUserService::class);

        $service->updateUserStatus($user, 'blocked', $superAdmin);
        $service->updateUserStatus($user->fresh(), 'blocked', $superAdmin);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'title' => 'Akun Ditangguhkan',
            'type' => 'suspend',
        ]);
        $this->assertSame(1, Notification::where('type', 'suspend')->count());
    }

    private function createUser(string $email, string $role): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $email,
            'password' => bcrypt('password123'),
            'role' => $role,
            'status' => 'active',
        ]);
    }

    private function createHotel(User $admin): Hotel
    {
        $city = City::create([
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
        ]);

        return Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => 'Test Hotel',
            'slug' => 'test-hotel-'.$admin->id,
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);
    }
}
