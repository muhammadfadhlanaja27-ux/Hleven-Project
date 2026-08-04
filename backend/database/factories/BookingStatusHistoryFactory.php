<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingStatusHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),

            'old_status' => BookingStatus::PENDING,

            'new_status' => fake()->randomElement(
                BookingStatus::cases()
            ),

            'changed_by' => User::factory(),

            'changed_at' => now(),
        ];
    }
}