<?php

namespace Tests\Feature;

use App\Models\BedType;
use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BedTypeTest extends TestCase
{
    use RefreshDatabase;

    private function makeHotel(string $email, string $slug): array
    {
        $user = User::create([
            'name' => 'Hotel Admin',
            'email' => $email,
            'password' => bcrypt('password123'),
            'role' => 'admin_hotel',
            'status' => 'active',
        ]);

        $city = City::create([
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
        ]);

        $hotel = Hotel::create([
            'admin_id' => $user->id,
            'city_id' => $city->id,
            'name' => 'Hotel '.$slug,
            'slug' => $slug,
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        return [$user, $hotel];
    }

    public function test_room_derives_capacity_from_selected_bed_type(): void
    {
        [$user, $hotel] = $this->makeHotel('admin@example.com', 'test-hotel');

        $bed = BedType::create([
            'hotel_id' => $hotel->id,
            'name' => 'King Bed',
            'max_adults' => 2,
            'max_children' => 1,
            'max_total' => 3,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/v1/admin/rooms', [
            'name' => 'Deluxe Room',
            'type' => 'Deluxe',
            'bed_type_id' => $bed->id,
            'weekday_price' => 500000,
            'weekend_price' => 650000,
            'stock' => 5,
        ]);

        $response->assertStatus(201);

        $room = RoomType::where('name', 'Deluxe Room')->firstOrFail();
        $this->assertSame($bed->id, $room->bed_type_id);
        $this->assertSame(2, $room->capacity_adult);
        $this->assertSame(1, $room->capacity_child);
    }

    public function test_admin_cannot_access_another_hotels_bed_type(): void
    {
        [$userA] = $this->makeHotel('admin-a@example.com', 'hotel-a');
        [, $hotelB] = $this->makeHotel('admin-b@example.com', 'hotel-b');

        $bedB = BedType::create([
            'hotel_id' => $hotelB->id,
            'name' => 'Queen Bed',
            'max_adults' => 2,
            'max_children' => 0,
            'max_total' => 2,
        ]);

        $this->actingAs($userA, 'sanctum');

        $this->getJson('/api/v1/admin/bed-types/'.$bedB->id)->assertStatus(404);
        $this->deleteJson('/api/v1/admin/bed-types/'.$bedB->id)->assertStatus(404);
    }

    public function test_room_cannot_reference_another_hotels_bed_type(): void
    {
        [$userA] = $this->makeHotel('admin-a@example.com', 'hotel-a');
        [, $hotelB] = $this->makeHotel('admin-b@example.com', 'hotel-b');

        $bedB = BedType::create([
            'hotel_id' => $hotelB->id,
            'name' => 'Queen Bed',
            'max_adults' => 2,
            'max_children' => 0,
            'max_total' => 2,
        ]);

        $this->actingAs($userA, 'sanctum');

        $this->postJson('/api/v1/admin/rooms', [
            'name' => 'Deluxe Room',
            'type' => 'Deluxe',
            'bed_type_id' => $bedB->id,
            'weekday_price' => 500000,
            'weekend_price' => 650000,
            'stock' => 5,
        ])->assertStatus(422);
    }
}
