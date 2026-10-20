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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManualBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_manual_booking_without_guest_email(): void
    {
        [$admin, $roomType] = $this->createHotelRoom();
        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson('/api/v1/admin/bookings/manual', [
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 1,
            'guest_name' => 'Test Guest',
            'guest_phone' => '081234567890',
            'payment_method' => 'cash',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.guests.0.email', null)
            ->assertJsonPath('data.booking_code', fn ($code) => str_starts_with($code, 'HLVN-'))
            ->assertJsonPath('data.children_count', 1);

        $this->assertDatabaseHas('guests', [
            'name' => 'Test Guest',
            'email' => null,
        ]);
        $this->assertDatabaseHas('bookings', ['children_count' => 1]);
    }

    public function test_manual_booking_validates_email_when_one_is_provided(): void
    {
        [$admin, $roomType] = $this->createHotelRoom();
        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/v1/admin/bookings/manual', [
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 0,
            'guest_name' => 'Test Guest',
            'guest_email' => 'not-an-email',
            'guest_phone' => '081234567890',
            'payment_method' => 'cash',
        ])->assertUnprocessable()->assertJsonValidationErrors('guest_email');
    }

    public function test_manual_booking_rejects_children_over_room_capacity(): void
    {
        [$admin, $roomType] = $this->createHotelRoom();
        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/v1/admin/bookings/manual', [
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 2,
            'guest_name' => 'Test Guest',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '081234567890',
            'payment_method' => 'cash',
        ])->assertUnprocessable()->assertJsonPath('message', 'Jumlah anak melebihi kapasitas kamar.');
    }

    public function test_booking_extension_rejects_hourly_duration(): void
    {
        [$admin] = $this->createHotelRoom();
        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/v1/admin/bookings/1/extend', [
            'type' => 'hours',
            'duration' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('type');
    }

    public function test_user_can_book_for_another_person_and_guest_details_are_saved(): void
    {
        [, $roomType] = $this->createHotelRoom();
        $booker = $this->createUser();
        $this->actingAs($booker, 'sanctum');

        $response = $this->postJson('/api/v1/user/bookings', [
            'hotel_id' => $roomType->hotel_id,
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(3)->toDateString(),
            'check_out' => now()->addDays(4)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 0,
            'guest_name' => 'Different Guest',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '081234567890',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.booking.user_id', $booker->id)
            ->assertJsonPath('data.booking.guests.0.name', 'Different Guest')
            ->assertJsonPath('data.booking.guests.0.email', 'guest@example.com')
            ->assertJsonPath('data.booking.guests.0.phone', '081234567890');

        $this->assertDatabaseHas('bookings', [
            'user_id' => $booker->id,
            'hotel_id' => $roomType->hotel_id,
        ]);
        $this->assertDatabaseHas('guests', [
            'name' => 'Different Guest',
            'email' => 'guest@example.com',
            'phone' => '081234567890',
        ]);

        $this->getJson('/api/v1/user/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.guests.0.name', 'Different Guest');
    }

    public function test_refundable_booking_cancelled_within_24_hours_is_automatically_refunded(): void
    {
        [$admin, $roomType] = $this->createHotelRoom();
        $user = $this->createUser();
        $booking = $this->createPaidBooking($user, $roomType, now()->subHours(23));
        RoomAvailability::create([
            'room_type_id' => $roomType->id,
            'date' => $booking->check_in,
            'available_stock' => 2,
            'booked_room' => 1,
        ]);
        $this->actingAs($user, 'sanctum');

        $this->postJson("/api/v1/user/bookings/{$booking->id}/cancel", [
            'reason' => 'Perubahan rencana',
        ])->assertOk()
            ->assertJsonPath('data.status', 'refunded')
            ->assertJsonPath('message', 'Refund disetujui otomatis karena pembatalan diajukan dalam 1x24 jam sejak pembayaran berhasil. Pengembalian dana diproses terpisah.');

        $this->assertDatabaseHas('room_availabilities', [
            'room_type_id' => $roomType->id,
            'date' => $booking->check_in,
            'available_stock' => 3,
            'booked_room' => 0,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'title' => 'Refund Disetujui Otomatis',
            'type' => 'refund',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'title' => 'Booking Dibatalkan',
            'type' => 'refund',
        ]);
    }

    private function createHotelRoom(): array
    {
        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin_hotel',
            'status' => 'active',
        ]);

        $city = City::create([
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
        ]);

        $hotel = Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => 'Test Hotel',
            'slug' => 'test-hotel',
            'description' => 'Hotel test',
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
        ]);

        return [$admin, $roomType];
    }

    private function createUser(): User
    {
        return User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);
    }

    private function createPaidBooking(User $user, RoomType $roomType, $paidAt): Booking
    {
        $booking = Booking::create([
            'booking_code' => 'HLVN-REFUND-'.uniqid(),
            'user_id' => $user->id,
            'hotel_id' => $roomType->hotel_id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
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
            'paid_at' => $paidAt,
        ]);

        return $booking;
    }
}
