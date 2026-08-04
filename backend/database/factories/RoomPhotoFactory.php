<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomPhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'room_type_id' => RoomType::factory(),

            'photo' => fake()->imageUrl(
                800,
                600,
                'room'
            ),

            'is_thumbnail' => fake()->boolean(20),
        ];
    }
}