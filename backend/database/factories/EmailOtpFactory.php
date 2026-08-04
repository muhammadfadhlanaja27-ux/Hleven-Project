<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EmailOtpFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email' => fake()->safeEmail(),

            'otp' => fake()->numerify('######'),

            'expired_at' => now()->addMinutes(10),

            'verified_at' => null,

            'created_at' => now(),
        ];
    }
}