<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\RoomTypeCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomTypeCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_room_type_categories(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('categories@example.com');
        $this->actingAs($admin, 'sanctum');

        $create = $this->postJson('/api/v1/admin/room-type-categories', [
            'name' => 'Deluxe',
            'description' => 'Kamar deluxe',
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Deluxe')
            ->assertJsonPath('data.hotel_id', $hotel->id)
            ->assertJsonPath('data.status', 'active');

        $categoryId = $create->json('data.id');

        $this->getJson('/api/v1/admin/room-type-categories')
            ->assertOk()
            ->assertJsonFragment(['id' => $categoryId, 'name' => 'Deluxe']);

        $this->putJson("/api/v1/admin/room-type-categories/{$categoryId}", [
            'name' => 'Deluxe Suite',
            'status' => 'inactive',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Deluxe Suite')
            ->assertJsonPath('data.status', 'inactive');

        $this->deleteJson("/api/v1/admin/room-type-categories/{$categoryId}")
            ->assertOk();

        $this->assertSoftDeleted('room_type_categories', ['id' => $categoryId]);
    }

    public function test_room_creation_uses_selected_category_and_syncs_legacy_type(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('category-room@example.com');
        $this->actingAs($admin, 'sanctum');

        $categoryId = $this->postJson('/api/v1/admin/room-type-categories', [
            'name' => 'Executive',
        ])->assertCreated()->json('data.id');

        $this->postJson('/api/v1/admin/rooms', [
            'name' => 'Executive King',
            'room_type_category_id' => $categoryId,
            'weekday_price' => 500000,
            'weekend_price' => 650000,
            'stock' => 3,
        ])->assertCreated()
            ->assertJsonPath('data.room_type_category_id', $categoryId)
            ->assertJsonPath('data.type', 'Executive')
            ->assertJsonPath('data.category.name', 'Executive');

        $this->assertDatabaseHas('room_types', [
            'hotel_id' => $hotel->id,
            'name' => 'Executive King',
            'room_type_category_id' => $categoryId,
            'type' => 'Executive',
        ]);
    }

    public function test_renaming_category_updates_linked_rooms(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('rename-category@example.com');
        $category = RoomTypeCategory::create([
            'hotel_id' => $hotel->id,
            'name' => 'Standard',
        ]);
        $room = RoomType::create([
            'hotel_id' => $hotel->id,
            'room_type_category_id' => $category->id,
            'name' => 'Standard Room',
            'type' => 'Standard',
            'weekday_price' => 100000,
            'weekend_price' => 120000,
            'stock' => 1,
            'capacity_adult' => 2,
            'capacity_child' => 0,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/room-type-categories/{$category->id}", [
                'name' => 'Superior',
            ])->assertOk();

        $this->assertSame('Superior', $room->fresh()->type);
    }

    public function test_category_cannot_be_deleted_while_used_by_a_room(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('used-category@example.com');
        $category = RoomTypeCategory::create([
            'hotel_id' => $hotel->id,
            'name' => 'Suite',
        ]);
        RoomType::create([
            'hotel_id' => $hotel->id,
            'room_type_category_id' => $category->id,
            'name' => 'Suite Room',
            'type' => 'Suite',
            'weekday_price' => 100000,
            'weekend_price' => 120000,
            'stock' => 1,
            'capacity_adult' => 2,
            'capacity_child' => 0,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/room-type-categories/{$category->id}")
            ->assertUnprocessable();

        $this->assertDatabaseHas('room_type_categories', [
            'id' => $category->id,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_cannot_use_another_hotels_category(): void
    {
        [$admin, $hotel] = $this->createHotelAdmin('owner-category@example.com');
        [, $otherHotel] = $this->createHotelAdmin('other-category@example.com');
        $otherCategory = RoomTypeCategory::create([
            'hotel_id' => $otherHotel->id,
            'name' => 'Villa',
        ]);

        $this->actingAs($admin, 'sanctum');

        $this->putJson("/api/v1/admin/room-type-categories/{$otherCategory->id}", [
            'name' => 'Hacked',
        ])->assertNotFound();

        $this->deleteJson("/api/v1/admin/room-type-categories/{$otherCategory->id}")
            ->assertNotFound();

        $this->postJson('/api/v1/admin/rooms', [
            'name' => 'Wrong Category Room',
            'room_type_category_id' => $otherCategory->id,
            'weekday_price' => 100000,
            'weekend_price' => 120000,
            'stock' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('room_type_category_id');

        $this->assertDatabaseMissing('room_types', [
            'hotel_id' => $hotel->id,
            'name' => 'Wrong Category Room',
        ]);
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
