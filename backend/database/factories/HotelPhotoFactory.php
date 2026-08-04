<?php

namespace Database\Factories;

use App\Models\Hotel;
use Illuminate\Database\Eloquent\Factories\Factory;

class HotelPhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),
            'photo' => fake()->imageUrl(800, 600, 'hotel'),
            'is_thumbnail' => fake()->boolean(20),
        ];
    }
}