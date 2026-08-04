<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),

            'activity' => fake()->randomElement([
                'Login',
                'Logout',
                'Create Hotel',
                'Update Room',
                'Booking',
                'Payment',
            ]),

            'description' => fake()->sentence(),

            'ip_address' => fake()->ipv4(),

            'created_at' => now(),
        ];
    }
}