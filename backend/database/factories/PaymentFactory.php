<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'payment_method' => PaymentMethod::QRIS,
            'payment_status' => fake()->randomElement(PaymentStatus::cases()),
            'gross_amount' => fake()->numberBetween(300000, 5000000),
            'transaction_id' => strtoupper(Str::random(20)),
            'order_id' => 'ORDER-' . strtoupper(Str::random(10)),
            'snap_token' => Str::random(40),
            'paid_at' => now(),
            'expired_at' => now()->addDay(),
        ];
    }
}