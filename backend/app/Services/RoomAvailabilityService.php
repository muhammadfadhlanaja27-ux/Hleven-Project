<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class RoomAvailabilityService
{
    /**
     * Hitung subtotal periode + deteksi tanggal yang ditutup admin.
     * Harga per tanggal (override) dipakai bila ada; jika tidak, jatuh ke weekday/weekend.
     *
     * @return array{subtotal: float, closed_dates: array<int, string>}
     */
    public function quote(RoomType $roomType, CarbonPeriod $period, int $qty): array
    {
        $weekday = (float) ($roomType->weekday_price ?? $roomType->price ?? 0);
        $weekend = (float) ($roomType->weekend_price ?? $weekday);

        $dates = [];
        foreach ($period as $date) {
            $dates[] = $date->format('Y-m-d');
        }

        $overrides = RoomAvailability::where('room_type_id', $roomType->id)
            ->whereIn('date', $dates)
            ->get()
            ->keyBy(fn ($row) => Carbon::parse($row->date)->format('Y-m-d'));

        $subtotal = 0.0;
        $closedDates = [];

        foreach ($period as $date) {
            $key = $date->format('Y-m-d');
            $row = $overrides->get($key);

            if ($row && $row->is_closed) {
                $closedDates[] = $key;

                continue;
            }

            $price = ($row && $row->price !== null)
                ? (float) $row->price
                : ($date->isWeekend() ? $weekend : $weekday);

            $subtotal += $price * $qty;
        }

        return ['subtotal' => $subtotal, 'closed_dates' => $closedDates];
    }

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
