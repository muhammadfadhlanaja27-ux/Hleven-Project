<?php

namespace Database\Factories;

use App\Enums\GenderType;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'gender' => fake()->randomElement(GenderType::cases()),
            'identity_number' => fake()->numerify('################'),
        ];
    }
}