<?php

namespace Database\Factories;

use App\Enums\WarningStatus;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarningFactory extends Factory
{
    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),

            'super_admin_id' => User::factory(),

            'title' => fake()->sentence(),

            'message' => fake()->paragraph(),

            'status' => fake()->randomElement(
                WarningStatus::cases()
            ),
        ];
    }
}