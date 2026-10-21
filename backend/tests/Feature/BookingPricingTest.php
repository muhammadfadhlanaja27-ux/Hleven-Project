<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_quote_uses_the_hotel_tax_rate(): void
    {
        [, $hotel, $roomType] = $this->createHotelRoom(10.0);

        $response = $this->postJson('/api/v1/bookings/quote', [
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
            'qty' => 2,
        ])->assertOk();

        $data = $response->json('data');

        $this->assertEquals(10.0, (float) $data['tax_rate']);
        $this->assertEquals(round($data['subtotal'] * 0.10, 2), (float) $data['tax']);
        $this->assertEquals($data['subtotal'] + $data['tax'], $data['grand_total']);
        $this->assertSame(2, $data['nights']);
    }

    public function test_manual_booking_snapshots_the_tax_rate_and_extension_keeps_it(): void
    {
        [$admin, $hotel, $roomType] = $this->createHotelRoom(10.0);
        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson('/api/v1/admin/bookings/manual', [
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 0,
            'guest_name' => 'Pricing Guest',
            'guest_phone' => '081234567890',
            'payment_method' => 'cash',
        ])->assertCreated();

        $booking = Booking::findOrFail($response->json('data.id'));
        $this->assertEquals(10.0, (float) $booking->tax_rate);
        $this->assertEquals(round((float) $booking->subtotal * 0.10, 2), (float) $booking->tax);

        $hotel->update(['tax_rate' => 7.5]);

        $extension = $this->postJson("/api/v1/admin/bookings/{$booking->id}/extend", [
            'type' => 'days',
            'duration' => 1,
        ])->assertOk();

        $this->assertEquals(45000, $extension->json('extension_summary.tax_added'));
        $this->assertEquals(10.0, (float) $booking->fresh()->tax_rate);
    }

    public function test_hotel_profile_accepts_and_validates_tax_rate(): void
    {
        [$admin, $hotel] = $this->createHotelRoom(5.0);
        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/v1/admin/hotel/profile', [
            'tax_rate' => 12.5,
        ])->assertOk();

        $this->assertEquals(12.5, (float) $hotel->fresh()->tax_rate);

        $this->postJson('/api/v1/admin/hotel/profile', [
            'tax_rate' => 101,
        ])->assertUnprocessable()->assertJsonValidationErrors('tax_rate');
    }

    private function createHotelRoom(float $taxRate): array
    {
        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => 'admin-'.uniqid().'@example.com',
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
            'name' => 'Pricing Hotel',
            'slug' => 'pricing-hotel-'.uniqid(),
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
            'tax_rate' => $taxRate,
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

        return [$admin, $hotel, $roomType];
    }
}
