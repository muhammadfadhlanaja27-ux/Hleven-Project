<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use App\Models\User;
use App\Services\WalletLedgerService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RefundCutoffTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::parse('2026-10-20 15:00:00', 'Asia/Jakarta'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_cancellation_outside_cutoff_is_automatically_refunded(): void
    {
        [$user, $hotel, $roomType] = $this->createHotelRoom();
        $booking = $this->createBooking($user, $hotel, $roomType, '2026-10-23', '2026-10-24');

        $wallet = app(WalletLedgerService::class);
        $wallet->recordPayment($booking);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/user/bookings/{$booking->id}/cancel", [
                'reason' => 'Perubahan rencana',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'refunded')
            ->assertJsonPath('message', 'Refund disetujui otomatis karena pembatalan dilakukan di luar batas 24 jam sebelum check-in. Pengembalian dana diproses terpisah.');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'refunded',
        ]);

        $this->assertDatabaseHas('room_availabilities', [
            'room_type_id' => $roomType->id,
            'available_stock' => 3,
            'booked_room' => 0,
        ]);

        $this->assertSame(0, $wallet->balance('hotel', $hotel->id, 'held'));
        $this->assertSame(0, $wallet->balance('platform', null, 'held'));
    }

    public function test_cancellation_inside_cutoff_cancels_without_refund(): void
    {
        [$user, $hotel, $roomType] = $this->createHotelRoom();
        $booking = $this->createBooking($user, $hotel, $roomType, '2026-10-21', '2026-10-22');

        $wallet = app(WalletLedgerService::class);
        $wallet->recordPayment($booking);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/user/bookings/{$booking->id}/cancel", [
                'reason' => 'Mendadak sakit',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('message', 'Pembatalan berhasil. Dana tidak dapat dikembalikan karena pembatalan dilakukan dalam 24 jam sebelum check-in.');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('room_availabilities', [
            'room_type_id' => $roomType->id,
            'available_stock' => 3,
            'booked_room' => 0,
        ]);

        $this->assertSame(0, $wallet->balance('hotel', $hotel->id, 'held'));
        $this->assertSame(400000, $wallet->balance('hotel', $hotel->id, 'available'));
        $this->assertSame(20000, $wallet->balance('platform', null, 'available'));
    }

    public function test_cancellation_exactly_at_cutoff_is_not_refunded(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 14:00:00', 'Asia/Jakarta'));

        [$user, $hotel, $roomType] = $this->createHotelRoom();
        $booking = $this->createBooking($user, $hotel, $roomType, '2026-10-21', '2026-10-22');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/user/bookings/{$booking->id}/cancel", [
                'reason' => 'Tepat di batas cutoff',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_non_refundable_room_is_cancelled_without_refund(): void
    {
        [$user, $hotel, $roomType] = $this->createHotelRoom(false);
        $booking = $this->createBooking($user, $hotel, $roomType, '2026-10-23', '2026-10-24');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/user/bookings/{$booking->id}/cancel", [
                'reason' => 'Batal',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('message', 'Pesanan dibatalkan. Kamar non-refundable — dana hangus tidak dikembalikan.');
    }

    public function test_user_bookings_exposes_refund_policy_fields_outside_cutoff(): void
    {
        [$user, $hotel, $roomType] = $this->createHotelRoom();
        $this->createBooking($user, $hotel, $roomType, '2026-10-23', '2026-10-24');

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/user/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.is_refundable', true)
            ->assertJsonPath('data.0.can_refund', true)
            ->assertJsonPath('data.0.is_within_cutoff', false)
            ->assertJsonPath('data.0.refund_block_reason', null)
            ->assertJsonPath('data.0.refund_cutoff_hours', 24)
            ->assertJsonPath('data.0.refund_deadline', '2026-10-22T14:00:00+07:00')
            ->assertJsonPath('data.0.check_in_at', '2026-10-23T14:00:00+07:00');
    }

    public function test_user_bookings_exposes_refund_policy_fields_inside_cutoff(): void
    {
        [$user, $hotel, $roomType] = $this->createHotelRoom();
        $this->createBooking($user, $hotel, $roomType, '2026-10-21', '2026-10-22');

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/user/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.is_refundable', true)
            ->assertJsonPath('data.0.can_refund', false)
            ->assertJsonPath('data.0.is_within_cutoff', true)
            ->assertJsonPath('data.0.refund_block_reason', 'cutoff')
            ->assertJsonPath('data.0.refund_cutoff_hours', 24);
    }

    private function createHotelRoom(bool $refundable = true): array
    {
        $suffix = uniqid();

        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => "admin-{$suffix}@example.com",
            'password' => bcrypt('password123'),
            'role' => 'admin_hotel',
            'status' => 'active',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => "user-{$suffix}@example.com",
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $city = City::create([
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
        ]);

        $hotel = Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => 'Refund Test Hotel',
            'slug' => "refund-test-hotel-{$suffix}",
            'description' => 'Hotel test refund',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        $roomType = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Standard Room',
            'type' => 'Standard',
            'bed' => '1 Queen Bed',
            'description' => 'Kamar nyaman',
            'weekday_price' => 400000,
            'weekend_price' => 500000,
            'stock' => 3,
            'capacity_adult' => 2,
            'capacity_child' => 1,
            'is_refundable' => $refundable,
        ]);

        return [$user, $hotel, $roomType];
    }

    private function createBooking(
        User $user,
        Hotel $hotel,
        RoomType $roomType,
        string $checkIn,
        string $checkOut
    ): Booking {
        $booking = Booking::create([
            'booking_code' => 'HLVN-CUTOFF-'.uniqid(),
            'user_id' => $user->id,
            'hotel_id' => $hotel->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'total_night' => 1,
            'subtotal' => 400000,
            'tax' => 20000,
            'grand_total' => 420000,
            'status' => 'paid',
        ]);

        BookingRoom::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'qty' => 1,
            'price_per_night' => 400000,
            'subtotal' => 400000,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'success',
            'gross_amount' => 420000,
            'order_id' => $booking->booking_code,
            'paid_at' => now(),
        ]);

        RoomAvailability::create([
            'room_type_id' => $roomType->id,
            'date' => $checkIn,
            'available_stock' => 2,
            'booked_room' => 1,
        ]);

        return $booking;
    }
}
