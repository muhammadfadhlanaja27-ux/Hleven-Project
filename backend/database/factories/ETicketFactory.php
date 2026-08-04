<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ETicketFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'qr_code' => Str::uuid(),
            'pdf_path' => 'tickets/' . Str::random(20) . '.pdf',
            'generated_at' => now(),
        ];
    }
}