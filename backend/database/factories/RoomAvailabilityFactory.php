<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomAvailabilityFactory extends Factory
{
    public function definition(): array
    {
        $stock = fake()->numberBetween(5, 20);

        $booked = fake()->numberBetween(0, $stock);

        return [
            'room_type_id' => RoomType::factory(),

            'date' => fake()->dateTimeBetween(
                'today',
                '+90 days'
            ),

            'available_stock' => $stock,

            'booked_room' => $booked,
        ];
    }
}