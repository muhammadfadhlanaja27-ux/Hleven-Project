<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingRoomFactory extends Factory
{
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 3);
        $price = fake()->numberBetween(300000, 1000000);

        return [
            'booking_id' => Booking::factory(),
            'room_type_id' => RoomType::factory(),
            'qty' => $qty,
            'price_per_night' => $price,
            'subtotal' => $qty * $price,
        ];
    }
}