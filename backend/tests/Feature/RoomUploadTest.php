<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Facility;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class RoomUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_room_with_facilities_and_multiple_photos(): void
    {
        $user = User::create([
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
            'admin_id' => $user->id,
            'city_id' => $city->id,
            'name' => 'Test Hotel',
            'slug' => 'test-hotel',
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        $facility1 = Facility::create(['name' => 'Wi-Fi', 'category' => 'Room']);
        $facility2 = Facility::create(['name' => 'AC', 'category' => 'Room']);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/v1/admin/rooms', [
            'name' => 'Deluxe Room',
            'type' => 'Deluxe',
            'bed' => '1 Single Bed',
            'description' => 'Kamar nyaman',
            'weekday_price' => 500000,
            'weekend_price' => 650000,
            'stock' => 5,
            'capacity_adult' => 2,
            'capacity_child' => 1,
            'facilities' => [$facility1->id, $facility2->id],
            'photos' => [
                UploadedFile::fake()->image('room1.jpg'),
                UploadedFile::fake()->image('room2.jpg'),
            ],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('room_types', ['name' => 'Deluxe Room', 'hotel_id' => $hotel->id]);

        $room = RoomType::where('name', 'Deluxe Room')->firstOrFail();
        $this->assertCount(2, $room->facilities);
        $this->assertCount(2, $room->photos);
    }

    public function test_admin_can_toggle_room_refund_policy_on_update(): void
    {
        $user = User::create([
            'name' => 'Hotel Admin',
            'email' => 'admin2@example.com',
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
            'name' => 'Test Hotel 2',
            'slug' => 'test-hotel-2',
            'description' => 'Hotel test',
            'address' => 'Jl. Test 456',
            'status' => 'active',
        ]);

        $room = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Standard Room',
            'type' => 'Standard',
            'bed' => '1 Queen Bed',
            'description' => 'Kamar default',
            'weekday_price' => 400000,
            'weekend_price' => 500000,
            'stock' => 3,
            'capacity_adult' => 2,
            'capacity_child' => 0,
            'is_refundable' => true,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->putJson('/api/v1/admin/rooms/' . $room->id, [
            'is_refundable' => false,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('room_types', ['id' => $room->id, 'is_refundable' => false]);
    }
}
