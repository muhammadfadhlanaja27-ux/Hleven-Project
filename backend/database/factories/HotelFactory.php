<?php

// database/factories/HotelFactory.php
namespace Database\Factories;

use App\Models\City;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class HotelFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->company . ' Hotel';
        return [
            'admin_id' => User::where('role', 'admin_hotel')->inRandomOrder()->first()?->id ?? 2,
            'city_id' => City::inRandomOrder()->first()?->id ?? 1,
            'name' => $name,
            'slug' => Str::slug($name) . '-' . rand(100, 999),
            'description' => $this->faker->paragraph(3),
            'address' => $this->faker->address,
            'average_rating' => 0.00,
            'total_review' => 0,
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'status' => 'active',
        ];
    }
}