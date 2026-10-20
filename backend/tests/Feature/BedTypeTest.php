<?php

namespace Tests\Feature;

use App\Models\BedType;
use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use Database\Seeders\BedTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BedTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_bed_types_for_their_hotel(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('beds@example.com');
        $this->actingAs($admin, 'sanctum');

        $create = $this->postJson('/api/v1/admin/bed-types', [
            'name' => '2 Queen Beds',
            'description' => 'Dua kasur queen',
        ])->assertCreated()
            ->assertJsonPath('data.name', '2 Queen Beds')
            ->assertJsonPath('data.hotel_id', $hotel->id);

        $bedTypeId = $create->json('data.id');

        $this->getJson('/api/v1/admin/bed-types')
            ->assertOk()
            ->assertJsonFragment(['id' => $bedTypeId, 'name' => '2 Queen Beds']);

        $this->putJson("/api/v1/admin/bed-types/{$bedTypeId}", [
            'name' => '2 Queen Beds Deluxe',
            'status' => 'inactive',
        ])->assertOk()
            ->assertJsonPath('data.name', '2 Queen Beds Deluxe')
            ->assertJsonPath('data.status', 'inactive');

        $this->deleteJson("/api/v1/admin/bed-types/{$bedTypeId}")
            ->assertOk();

        $this->assertSoftDeleted('bed_types', ['id' => $bedTypeId]);
    }

    public function test_admin_cannot_use_another_hotels_bed_type_for_room(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('owner@example.com');
        [, $otherHotel] = $this->createHotelAdmin('other@example.com');
        $otherBedType = BedType::create([
            'hotel_id' => $otherHotel->id,
            'name' => 'Private King',
            'status' => 'active',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/rooms', [
                'name' => 'Test Room',
                'type' => 'Standard',
                'bed_type_id' => $otherBedType->id,
                'weekday_price' => 100000,
                'weekend_price' => 120000,
                'stock' => 1,
                'capacity_adult' => 2,
                'capacity_child' => 0,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('bed_type_id');

        $this->assertDatabaseMissing('room_types', [
            'hotel_id' => $hotel->id,
            'name' => 'Test Room',
        ]);
    }

    public function test_room_creation_persists_the_selected_bed_type_and_legacy_name(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('roombed@example.com');
        $bedType = BedType::create([
            'hotel_id' => $hotel->id,
            'name' => '2 Queen Beds',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/rooms', [
                'name' => 'Deluxe Twin',
                'type' => 'Deluxe',
                'bed_type_id' => $bedType->id,
                'weekday_price' => 250000,
                'weekend_price' => 300000,
                'stock' => 2,
                'capacity_adult' => 2,
                'capacity_child' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.bed_type_id', $bedType->id)
            ->assertJsonPath('data.bed_type.name', '2 Queen Beds')
            ->assertJsonPath('data.bed', '2 Queen Beds');

        $this->assertDatabaseHas('room_types', [
            'hotel_id' => $hotel->id,
            'name' => 'Deluxe Twin',
            'bed_type_id' => $bedType->id,
            'bed' => '2 Queen Beds',
        ]);
    }

    public function test_bed_type_cannot_be_deleted_while_used_by_a_room(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('used@example.com');
        $bedType = BedType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Used Queen',
            'status' => 'active',
        ]);
        RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Room with a bed',
            'type' => 'Standard',
            'bed' => $bedType->name,
            'bed_type_id' => $bedType->id,
            'weekday_price' => 100000,
            'weekend_price' => 120000,
            'stock' => 1,
            'capacity_adult' => 2,
            'capacity_child' => 0,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/bed-types/{$bedType->id}")
            ->assertUnprocessable();

        $this->assertDatabaseHas('bed_types', ['id' => $bedType->id, 'deleted_at' => null]);
    }

    public function test_bed_type_seeder_is_idempotent_for_each_hotel(): void
    {
        [, $hotel] = $this->createHotelAdmin('seedbeds@example.com');
        $seeder = new BedTypeSeeder;

        $seeder->run();
        $seeder->run();

        $this->assertSame(4, BedType::where('hotel_id', $hotel->id)->count());
    }

    public function test_room_derives_capacity_from_selected_bed_type(): void
    {
        [$user, $hotel] = $this->createHotelAdmin('admin@example.com', 'test-hotel');

        $bed = BedType::create([
            'hotel_id' => $hotel->id,
            'name' => 'King Bed',
            'max_adults' => 2,
            'max_children' => 1,
            'max_total' => 3,
            'status' => 'active',
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
        [$userA] = $this->createHotelAdmin('admin-a@example.com', 'hotel-a');
        [, $hotelB] = $this->createHotelAdmin('admin-b@example.com', 'hotel-b');

        $bedB = BedType::create([
            'hotel_id' => $hotelB->id,
            'name' => 'Queen Bed',
            'max_adults' => 2,
            'max_children' => 0,
            'max_total' => 2,
            'status' => 'active',
        ]);

        $this->actingAs($userA, 'sanctum');

        $this->getJson('/api/v1/admin/bed-types/'.$bedB->id)->assertStatus(404);
        $this->deleteJson('/api/v1/admin/bed-types/'.$bedB->id)->assertStatus(404);
    }

    public function test_room_cannot_reference_another_hotels_bed_type(): void
    {
        [$userA] = $this->createHotelAdmin('admin-a@example.com', 'hotel-a');
        [, $hotelB] = $this->createHotelAdmin('admin-b@example.com', 'hotel-b');

        $bedB = BedType::create([
            'hotel_id' => $hotelB->id,
            'name' => 'Queen Bed',
            'max_adults' => 2,
            'max_children' => 0,
            'max_total' => 2,
            'status' => 'active',
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

    private function createHotelAdmin(string $email, ?string $slug = null): array
    {
        $admin = User::create([
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

        $slug = $slug ?? ('hotel-'.strstr($email, '@', true));

        $hotel = Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => 'Hotel '.$slug,
            'slug' => $slug,
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        return [$admin, $hotel];
    }
}
