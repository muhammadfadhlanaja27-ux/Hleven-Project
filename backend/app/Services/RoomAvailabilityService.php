<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RoomAvailability;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class RoomAvailabilityService
{
    /**
     * Mengembalikan stok kamar saat booking dibatalkan/expired[cite: 1]
     */
    public function restoreStock(Booking $booking): void
    {
        // Ambil periode menginap dari check-in hingga H-1 check-out
        $checkIn = Carbon::parse($booking->check_in);
        $checkOut = Carbon::parse($booking->check_out)->subDay();
        $period = CarbonPeriod::create($checkIn, $checkOut);

        $dates = [];
        foreach ($period as $date) {
            $dates[] = $date->format('Y-m-d');
        }

        // Looping setiap kamar yang dipesan pada booking ini
        foreach ($booking->bookingRooms as $bookingRoom) {

            // Kembalikan stok pada tabel room_availabilities[cite: 1]
            RoomAvailability::where('room_type_id', $bookingRoom->room_type_id)
                ->whereIn('date', $dates)
                ->decrement('booked_room', $bookingRoom->qty);

            RoomAvailability::where('room_type_id', $bookingRoom->room_type_id)
                ->whereIn('date', $dates)
                ->increment('available_stock', $bookingRoom->qty);
        }
    }
}
