<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminHotelAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_detail_is_scoped_to_the_authenticated_admin_hotel(): void
    {
        [$admin, $hotel] = $this->createAdminHotel('owner');
        [, $otherHotel] = $this->createAdminHotel('other');

        $ownBooking = $this->createBooking($hotel);
        $foreignBooking = $this->createBooking($otherHotel);

        $this->actingAs($admin, 'sanctum');

        $this->getJson("/api/v1/admin/bookings/{$foreignBooking->id}")
            ->assertNotFound();

        $this->getJson("/api/v1/admin/bookings/{$ownBooking->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $ownBooking->id);
    }

    public function test_room_policies_are_saved_on_create_and_update(): void
    {
        [$admin, $hotel] = $this->createAdminHotel('rooms');

        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/v1/admin/rooms', [
            'name' => 'Policy Room',
            'type' => 'Standard',
            'bed' => '1 Queen Bed',
            'description' => 'Room with policies',
            'policies' => 'Check-in 14:00. No smoking.',
            'weekday_price' => 400000,
            'weekend_price' => 500000,
            'stock' => 3,
            'capacity_adult' => 2,
            'capacity_child' => 0,
        ])->assertCreated();

        $room = RoomType::where('hotel_id', $hotel->id)
            ->where('name', 'Policy Room')
            ->firstOrFail();

        $this->assertSame('Check-in 14:00. No smoking.', $room->policies);

        $this->putJson("/api/v1/admin/rooms/{$room->id}", [
            'policies' => 'Check-in 15:00. No pets.',
        ])->assertOk();

        $this->assertSame('Check-in 15:00. No pets.', $room->fresh()->policies);
    }

    public function test_payment_status_filter_accepts_legacy_expire_value(): void
    {
        [$admin, $hotel] = $this->createAdminHotel('payments');
        $booking = $this->createBooking($hotel);
        $payment = $this->createPayment($booking, 'expired');

        $this->actingAs($admin, 'sanctum');

        $this->getJson('/api/v1/hotel/payments?status=expire')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $payment->id);
    }

    private function createAdminHotel(string $suffix): array
    {
        $admin = User::create([
            'name' => "Hotel Admin {$suffix}",
            'email' => "admin-{$suffix}@example.com",
            'password' => bcrypt('password123'),
            'role' => 'admin_hotel',
            'status' => 'active',
        ]);

        $city = City::create([
            'province' => 'Jawa Barat',
            'city' => "Bandung {$suffix}",
        ]);

        $hotel = Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => "Hotel {$suffix}",
            'slug' => "hotel-{$suffix}",
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
            'tax_rate' => 5,
        ]);

        return [$admin, $hotel];
    }

    private function createBooking(Hotel $hotel): Booking
    {
        return Booking::create([
            'booking_code' => 'AUDIT-'.uniqid(),
            'hotel_id' => $hotel->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'total_night' => 1,
            'subtotal' => 400000,
            'tax' => 20000,
            'tax_rate' => 5,
            'grand_total' => 420000,
            'status' => 'paid',
        ]);
    }

    private function createPayment(Booking $booking, string $status): Payment
    {
        return Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'bank_transfer',
            'payment_status' => $status,
            'gross_amount' => $booking->grand_total,
            'order_id' => 'PAY-'.uniqid(),
            'paid_at' => $status === 'success' ? now() : null,
        ]);
    }
}
