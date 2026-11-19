<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\PartnerApplication;
use App\Models\User;
use App\Services\PartnerApplicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelPropertyDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_admin_can_update_property_type_and_year_built(): void
    {
        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => 'hotel-admin@example.com',
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
            'name' => 'Harris Hotel',
            'slug' => 'harris-hotel',
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/hotel/profile', [
                'property_type' => 'Business Hotel',
                'year_built' => 2018,
            ])
            ->assertOk()
            ->assertJsonPath('data.property_type', 'Business Hotel')
            ->assertJsonPath('data.year_built', 2018);

        $this->assertSame('Business Hotel', $hotel->fresh()->property_type);
        $this->assertSame(2018, $hotel->fresh()->year_built);

        $this->postJson('/api/v1/admin/hotel/profile', [
            'year_built' => now()->year + 1,
        ])->assertUnprocessable()->assertJsonValidationErrors('year_built');
    }

    public function test_approving_partner_application_copies_property_details_to_hotel(): void
    {
        $owner = User::create([
            'name' => 'Hotel Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'super-admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'super_admin',
            'status' => 'active',
        ]);
        $application = PartnerApplication::create([
            'user_id' => $owner->id,
            'application_number' => 'HLVN-MIT-TEST1234',
            'owner_name' => 'Hotel Owner',
            'owner_email' => 'owner@example.com',
            'owner_phone' => '08123456789',
            'owner_id_number' => '1234567890123456',
            'hotel_name' => 'Harris Business Hotel',
            'property_type' => 'Business Hotel',
            'year_built' => 2018,
            'hotel_email' => 'owner@example.com',
            'hotel_phone' => '08123456789',
            'address' => 'Jl. Test 123',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'status' => 'pending',
        ]);

        app(PartnerApplicationService::class)->approveApplication($application, $superAdmin);

        $hotel = Hotel::where('admin_id', $owner->id)->firstOrFail();
        $this->assertSame('Business Hotel', $hotel->property_type);
        $this->assertSame(2018, $hotel->year_built);
    }
}
