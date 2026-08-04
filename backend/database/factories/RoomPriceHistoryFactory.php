<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomPriceHistoryFactory extends Factory
{
    public function definition(): array
    {
        $weekday = fake()->numberBetween(
            250000,
            900000
        );

        return [
            'room_type_id' => RoomType::factory(),

            'weekday_price' => $weekday,

            'weekend_price' => $weekday + fake()->numberBetween(
                50000,
                200000
            ),

            'effective_from' => now(),

            'effective_until' => now()->addMonths(
                fake()->numberBetween(1, 6)
            ),
        ];
    }
}