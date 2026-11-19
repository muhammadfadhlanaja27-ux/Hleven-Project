<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_identical_repeated_booking_returns_same_booking(): void
    {
        [, $roomType] = $this->createHotelRoom(stock: 3);
        $payload = $this->payload($roomType);

        $first = $this->postJson('/api/v1/bookings', $payload)->assertCreated();
        $firstId = $first->json('data.booking.id');

        $second = $this->postJson('/api/v1/bookings', $payload)->assertOk();
        $second->assertJsonPath('duplicate', true)
            ->assertJsonPath('data.booking.id', $firstId);

        $this->assertDatabaseCount('bookings', 1);
        $this->assertDatabaseCount('payments', 1);
        $this->assertSame(2, RoomAvailability::where('room_type_id', $roomType->id)->value('available_stock'));
    }

    public function test_idempotency_key_is_persisted_and_reused(): void
    {
        [, $roomType] = $this->createHotelRoom(stock: 3);
        $payload = $this->payload($roomType, ['idempotency_key' => 'abc-123']);

        $first = $this->postJson('/api/v1/bookings', $payload)->assertCreated();
        $firstId = $first->json('data.booking.id');

        $this->assertDatabaseHas('bookings', ['id' => $firstId, 'idempotency_key' => 'abc-123']);

        // Retry dengan key sama walau payload berubah tetap mengembalikan booking pertama.
        $payload['qty'] = 2;
        $this->postJson('/api/v1/bookings', $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', true)
            ->assertJsonPath('data.booking.id', $firstId);

        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_stock_is_not_double_decremented_and_can_exhaust(): void
    {
        [, $roomType] = $this->createHotelRoom(stock: 1);

        $this->postJson('/api/v1/bookings', $this->payload($roomType, ['guest_email' => 'a@example.com']))
            ->assertCreated();

        $this->postJson('/api/v1/bookings', $this->payload($roomType, ['guest_email' => 'b@example.com']))
            ->assertStatus(422);

        $this->assertDatabaseCount('bookings', 1);
    }

    private function payload(RoomType $roomType, array $overrides = []): array
    {
        return array_merge([
            'hotel_id' => $roomType->hotel_id,
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 0,
            'guest_name' => 'Guest One',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '081234567890',
        ], $overrides);
    }

    private function createHotelRoom(int $stock = 3): array
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
            'stock' => $stock,
            'capacity_adult' => 2,
            'capacity_child' => 1,
        ]);

        return [$admin, $roomType];
    }
}
