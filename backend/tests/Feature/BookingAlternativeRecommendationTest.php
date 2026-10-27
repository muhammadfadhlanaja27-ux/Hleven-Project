<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingAlternativeRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_other_hotel_suggestions_include_hotel_distance_and_room_details(): void
    {
        [$sourceHotel, $sourceRoom] = $this->createHotelRoom(
            'Source Hotel',
            'Source Room',
            1,
            0,
            0
        );
        [$alternativeHotel, $alternativeRoom] = $this->createHotelRoom(
            'Nearby Hotel',
            'Deluxe Twin',
            3,
            0,
            0.01,
            $sourceHotel->city_id
        );

        $alternativeRoom->update([
            'bed' => '2 Single Beds',
            'bed_count' => 2,
            'description' => 'Kamar twin dengan balkon.',
        ]);

        $payload = [
            'hotel_id' => $sourceHotel->id,
            'room_type_id' => $sourceRoom->id,
            'check_in' => now()->addDays(3)->toDateString(),
            'check_out' => now()->addDays(4)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'children' => 0,
            'guest_name' => 'First Guest',
            'guest_email' => 'first@example.com',
            'guest_phone' => '081234567890',
        ];

        $this->postJson('/api/v1/bookings', $payload)->assertCreated();

        $payload['guest_name'] = 'Second Guest';
        $payload['guest_email'] = 'second@example.com';

        $response = $this->postJson('/api/v1/bookings', $payload)->assertUnprocessable();
        $suggestion = $response->json('suggestions.rooms.0');

        $this->assertSame('other_hotels_in_city', $response->json('suggestions.type'));
        $this->assertSame($alternativeHotel->name, $suggestion['hotel']['name']);
        $this->assertSame($alternativeHotel->address, $suggestion['hotel']['address']);
        $this->assertGreaterThan(1, $suggestion['distance_km']);
        $this->assertSame($alternativeRoom->id, $suggestion['id']);
        $this->assertSame('2 Single Beds', $suggestion['bed']);
        $this->assertSame(2, $suggestion['bed_count']);
        $this->assertSame('Kamar twin dengan balkon.', $suggestion['description']);
    }

    private function createHotelRoom(
        string $hotelName,
        string $roomName,
        int $stock,
        float $latitude,
        float $longitude,
        ?int $cityId = null
    ): array {
        $city = $cityId
            ? City::findOrFail($cityId)
            : City::create([
                'province' => 'Jawa Barat',
                'city' => 'Bandung',
            ]);

        $admin = User::create([
            'name' => $hotelName.' Admin',
            'email' => strtolower(str_replace(' ', '-', $hotelName)).'@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin_hotel',
            'status' => 'active',
        ]);

        $hotel = Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => $hotelName,
            'slug' => strtolower(str_replace(' ', '-', $hotelName)),
            'description' => $hotelName.' description',
            'address' => 'Jl. '.$hotelName.' No. 1',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'status' => 'active',
        ]);

        $roomType = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => $roomName,
            'type' => 'Deluxe',
            'bed' => '1 Queen Bed',
            'description' => 'Kamar nyaman.',
            'weekday_price' => 400000,
            'weekend_price' => 500000,
            'stock' => $stock,
            'capacity_adult' => 2,
            'capacity_child' => 1,
        ]);

        return [$hotel, $roomType];
    }
}
