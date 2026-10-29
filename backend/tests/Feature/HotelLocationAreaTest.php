<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HotelLocationAreaTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_admin_can_resolve_location_area_from_hotel_name(): void
    {
        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => 'location-admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin_hotel',
            'status' => 'active',
        ]);
        $city = City::create([
            'province' => 'Aceh',
            'city' => 'Banda Aceh',
        ]);
        Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => 'Padma Hotel Bandung',
            'slug' => 'padma-hotel-bandung',
            'description' => 'Hotel test',
            'address' => 'Alamat hotel baru',
            'status' => 'active',
        ]);

        Http::fake([
            'nominatim.openstreetmap.org/search*' => Http::response([[
                'address' => [
                    'city' => 'Kota Bandung',
                    'state' => 'Jawa Barat',
                    'country' => 'Indonesia',
                ],
            ]]),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/hotel/location-area')
            ->assertOk()
            ->assertJsonPath('data.location_area', 'Kota Bandung, Jawa Barat, Indonesia')
            ->assertJsonPath('data.source', 'OpenStreetMap');

        Http::assertSent(fn ($request) => str_contains($request->url(), '/search')
            && $request['q'] === 'Padma Hotel Bandung, Indonesia'
            && str_contains($request->header('User-Agent')[0] ?? '', 'HLevenHotelPlatform'));
    }
}
