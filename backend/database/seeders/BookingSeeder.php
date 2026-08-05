<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\ETicket;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\Review;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        Booking::factory(50)->create()->each(function ($booking) {

            BookingRoom::factory()->create([
                'booking_id' => $booking->id,
            ]);

            Guest::factory()->create([
                'booking_id' => $booking->id,
            ]);

            Payment::factory()->create([
                'booking_id' => $booking->id,
            ]);

            ETicket::factory()->create([
                'booking_id' => $booking->id,
            ]);

            Review::factory()->create([
                'booking_id' => $booking->id,
                'hotel_id' => $booking->hotel_id,
                'user_id' => $booking->user_id,
            ]);

        });
    }
}