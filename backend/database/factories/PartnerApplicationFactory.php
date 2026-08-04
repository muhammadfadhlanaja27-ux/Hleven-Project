<?php

namespace Database\Factories;

use App\Enums\PartnerStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnerApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_name' => fake()->name(),

            'hotel_name' => fake()->company() . ' Hotel',

            'email' => fake()->safeEmail(),

            'phone' => fake()->phoneNumber(),

            'status' => fake()->randomElement(
                PartnerStatus::cases()
            ),

            'created_at' => now(),
        ];
    }
}