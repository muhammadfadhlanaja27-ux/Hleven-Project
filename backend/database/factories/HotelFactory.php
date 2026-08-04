<?php

namespace Database\Factories;

use App\Enums\HotelStatus;
use App\Models\City;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class HotelFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company().' Hotel';

        return [
            'admin_id' => User::factory(),
            'city_id' => City::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'address' => fake()->address(),
            'average_rating' => fake()->randomFloat(2, 3, 5),
            'total_review' => fake()->numberBetween(0, 1000),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'status' => HotelStatus::ACTIVE,
        ];
    }
}