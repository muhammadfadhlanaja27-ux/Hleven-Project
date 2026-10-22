<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Facility;
use App\Models\Hotel;
use App\Models\User;
use Database\Seeders\FacilitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacilityCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_lists_existing_facilities_and_filters_by_category(): void
    {
        Facility::create(['name' => 'Wi-Fi', 'category' => 'Hotel']);
        Facility::create(['name' => 'AC', 'category' => 'Room']);

        $this->getJson('/api/v1/facilities?category=hotel&hotel_id=999')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Wi-Fi');
    }

    public function test_facility_catalog_does_not_expose_create_update_or_delete_endpoints(): void
    {
        $facility = Facility::create(['name' => 'Wi-Fi', 'category' => 'Hotel']);

        $this->postJson('/api/v1/facilities', [
            'name' => 'New Facility',
            'category' => 'Hotel',
        ])->assertStatus(405);

        $this->putJson("/api/v1/facilities/{$facility->id}", [
            'name' => 'Changed Facility',
        ])->assertNotFound();

        $this->deleteJson("/api/v1/facilities/{$facility->id}")
            ->assertNotFound();
    }

    public function test_facility_seeder_includes_separate_hotel_room_and_bathroom_options(): void
    {
        (new FacilitySeeder)->run();

        $this->assertDatabaseHas('facilities', [
            'name' => 'Sarapan',
            'category' => 'Hotel',
        ]);
        $this->assertDatabaseHas('facilities', [
            'name' => 'Brankas Kamar',
            'category' => 'Room',
        ]);
        $this->assertDatabaseHas('facilities', [
            'name' => 'Handuk',
            'category' => 'Bathroom',
        ]);
        $this->assertDatabaseHas('facilities', [
            'name' => 'Bar & Lounge',
            'category' => 'Hotel',
        ]);
        $this->assertDatabaseHas('facilities', [
            'name' => 'Pemandangan Laut',
            'category' => 'Room',
        ]);
        $this->assertDatabaseHas('facilities', [
            'name' => 'Rain Shower',
            'category' => 'Bathroom',
        ]);
        $this->assertDatabaseHas('facilities', [
            'name' => 'Detektor Asap',
            'category' => 'Hotel',
            'icon' => 'detector_smoke',
        ]);
    }

    public function test_facility_seeder_is_idempotent_and_keeps_categories_separate(): void
    {
        (new FacilitySeeder)->run();
        (new FacilitySeeder)->run();

        $this->assertSame(42, Facility::whereNull('hotel_id')->where('category', 'Hotel')->count());
        $this->assertSame(41, Facility::whereNull('hotel_id')->where('category', 'Room')->count());
        $this->assertSame(17, Facility::whereNull('hotel_id')->where('category', 'Bathroom')->count());
        $this->assertSame(1, Facility::whereNull('hotel_id')->where('name', 'Bar & Lounge')->count());
    }

    public function test_facility_seeder_does_not_overwrite_hotel_specific_facilities(): void
    {
        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => 'facility-custom@example.com',
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
            'name' => 'Hotel Custom Facility',
            'slug' => 'hotel-custom-facility',
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        $custom = Facility::create([
            'hotel_id' => $hotel->id,
            'name' => 'Bar & Lounge',
            'category' => 'Hotel',
            'icon' => 'star',
        ]);

        (new FacilitySeeder)->run();

        $this->assertSame('star', $custom->fresh()->icon);
        $this->assertSame(1, Facility::whereNull('hotel_id')->where('name', 'Bar & Lounge')->count());
    }
}
