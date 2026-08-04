<?php

namespace Database\Factories;

use App\Models\Hotel;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),

            'name' => fake()->randomElement([
                'Standard Room',
                'Superior Room',
                'Deluxe Room',
                'Executive Room',
                'Suite Room',
                'Family Room',
            ]),

            'description' => fake()->paragraph(),

            'weekday_price' => fake()->numberBetween(250000, 900000),

            'weekend_price' => fake()->numberBetween(300000, 1200000),

            'stock' => fake()->numberBetween(5, 30),

            'capacity_adult' => fake()->numberBetween(1, 4),

            'capacity_child' => fake()->numberBetween(0, 2),

            'breakfast' => fake()->boolean(),

            'smoking_area' => fake()->boolean(),
        ];
    }
}