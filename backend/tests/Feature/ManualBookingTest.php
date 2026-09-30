<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
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
}