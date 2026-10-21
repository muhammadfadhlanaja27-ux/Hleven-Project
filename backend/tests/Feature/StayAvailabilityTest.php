<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use App\Services\HotelOccupancyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StayAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_room_list_reports_today_occupied_and_available_stock(): void
    {
        [, $hotel, $roomType] = $this->createHotelRoom();
        $this->createStay($hotel, $roomType, 'paid', 2);

        $response = $this->getJson(
            "/api/v1/hotels/{$hotel->id}/rooms?check_in=".now()->toDateString().
            '&check_out='.now()->addDay()->toDateString()
        )->assertOk();

        $response->assertJsonPath('data.0.occupied', 2)
            ->assertJsonPath('data.0.available_stock', 3);
    }

    public function test_occupancy_counts_active_stays_overlapping_today(): void
    {
        [, $hotel, $roomType] = $this->createHotelRoom();
        $this->createStay($hotel, $roomType, 'paid', 2);

        $summary = app(HotelOccupancyService::class)->summary($hotel);

        $this->assertSame(5, $summary['total_rooms']);
        $this->assertSame(2, $summary['occupied_rooms']);
        $this->assertSame(3, $summary['available_rooms']);
    }

    private function createStay(Hotel $hotel, RoomType $roomType, string $status, int $qty): Booking
    {
        $booking = Booking::create([
            'booking_code' => 'HLVN-STAY-'.uniqid(),
            'hotel_id' => $hotel->id,
            'check_in' => now()->toDateString(),
            'check_out' => now()->addDay()->toDateString(),
            'total_night' => 1,
            'subtotal' => 400000,
            'tax' => 20000,
            'grand_total' => 420000,
            'status' => $status,
        ]);

        BookingRoom::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'qty' => $qty,
            'price_per_night' => 400000,
            'subtotal' => 400000 * $qty,
        ]);

        return $booking;
    }

    private function createHotelRoom(): array
    {
        $admin = User::create([
            'name' => 'Hotel Admin',
            'email' => 'admin-'.uniqid().'@example.com',
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
            'name' => 'Availability Hotel',
            'slug' => 'availability-hotel-'.uniqid(),
            'description' => 'Hotel test',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);

        $roomType = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Standard Room',
            'weekday_price' => 400000,
            'weekend_price' => 500000,
            'stock' => 5,
            'capacity_adult' => 2,
            'capacity_child' => 0,
        ]);

        return [$admin, $hotel, $roomType];
    }
}
