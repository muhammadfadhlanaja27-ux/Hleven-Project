<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('+1 day', '+30 days');
        $night = fake()->numberBetween(1, 5);
        $subtotal = fake()->numberBetween(300000, 3000000);
        $tax = $subtotal * 0.11;

        return [
            'booking_code' => 'HLV-' . strtoupper(Str::random(8)),
            'user_id' => User::factory(),
            'hotel_id' => Hotel::factory(),
            'check_in' => $checkIn,
            'check_out' => (clone $checkIn)->modify("+{$night} days"),
            'total_night' => $night,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'grand_total' => $subtotal + $tax,
            'special_request' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(BookingStatus::cases()),
        ];
    }
}