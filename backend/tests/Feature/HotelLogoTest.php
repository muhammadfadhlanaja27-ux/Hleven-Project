<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HotelLogoTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_admin_can_upload_and_remove_hotel_logo(): void
    {
        Storage::fake('public');

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

        $this->actingAs($admin, 'sanctum');

        $uploadResponse = $this->post('/api/v1/admin/hotel/profile/logo', [
            'logo' => UploadedFile::fake()->image('hotel-logo.png'),
        ]);

        $uploadResponse->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.logo', fn ($logo) => is_string($logo) && $logo !== '');

        $hotel->refresh();
        $this->assertNotNull($hotel->logo);
        $this->assertCount(1, Storage::disk('public')->allFiles("hotels/{$hotel->id}/logo"));

        $this->getJson('/api/v1/admin/hotel/profile')
            ->assertOk()
            ->assertJsonPath('data.logo', $hotel->logo);

        $this->getJson("/api/v1/hotels/{$hotel->id}")
            ->assertOk()
            ->assertJsonPath('data.logo', $hotel->logo);

        $this->deleteJson('/api/v1/admin/hotel/profile/logo')
            ->assertOk()
            ->assertJsonPath('data.logo', null);

        $this->assertDatabaseHas('hotels', [
            'id' => $hotel->id,
            'logo' => null,
        ]);
        $this->assertSame([], Storage::disk('public')->allFiles("hotels/{$hotel->id}/logo"));
    }
}
