<?php

namespace App\Services;

use App\Models\RoomType;
use App\Models\RoomAvailability;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class BookingService
{
    /**
     * Validasi Kapasitas
     * Memastikan jumlah tamu tidak melebihi kapasitas kamar yang dipesan
     */
    public function validateCapacity($roomTypeId, $adults, $children, $qty)
    {
        $room = RoomType::findOrFail($roomTypeId);
        
        // Total kapasitas untuk jumlah kamar yang dipesan
        $totalMaxAdult = $room->capacity_adult * $qty;
        $totalMaxChild = $room->capacity_child * $qty;

        // Logika: Jika total orang dewasa melebihi kapasitas total kamar yang dipesan
        if ($adults > $totalMaxAdult) {
            return [
                'allowed' => false,
                'message' => "Kapasitas tidak mencukupi. Mohon tambah jumlah kamar atau pilih tipe kamar yang lebih besar."
            ];
        }

        return ['allowed' => true];
    }

    public function calculatePrice($roomTypeId, $checkIn, $checkOut)
    {
        // ... (kode tetap sama seperti sebelumnya) ...
        $room = RoomType::findOrFail($roomTypeId);
        $period = CarbonPeriod::create($checkIn, Carbon::parse($checkOut)->subDay());
        $total = 0;
        foreach ($period as $date) {
            $total += ($date->isWeekend()) ? $room->weekend_price : $room->weekday_price;
        }
        return $total;
    }

    public function checkAvailability($roomTypeId, $checkIn, $checkOut, $qty)
    {
        // ... (kode tetap sama seperti sebelumnya) ...
        $period = CarbonPeriod::create($checkIn, Carbon::parse($checkOut)->subDay());
        foreach ($period as $date) {
            $avail = RoomAvailability::where('room_type_id', $roomTypeId)
                        ->where('date', $date->format('Y-m-d'))
                        ->first();
            $currentStock = $avail ? $avail->available_stock : RoomType::find($roomTypeId)->stock;
            if ($currentStock < $qty) return false;
        }
        return true;
    }
}