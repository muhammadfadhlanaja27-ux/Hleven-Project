<?php

namespace Tests\Feature;

use App\Models\Facility;
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
    }
}
