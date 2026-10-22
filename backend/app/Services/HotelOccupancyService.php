<?php

namespace App\Services;

use App\Models\BookingRoom;
use App\Models\Hotel;
use App\Models\RoomType;

class HotelOccupancyService
{
    /**
     * @return array{total_rooms: int, occupied_rooms: int, available_rooms: int}
     */
    public function summary(Hotel $hotel): array
    {
        $totalRooms = (int) RoomType::where('hotel_id', $hotel->id)->sum('stock');
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $occupiedRooms = (int) BookingRoom::whereHas('booking', function ($query) use ($hotel, $today, $tomorrow) {
            $query->where('hotel_id', $hotel->id)
                ->whereIn('status', ['paid', 'confirmed', 'checked_in'])
                ->where('check_in', '<', $tomorrow)
                ->where('check_out', '>', $today);
        })->sum('qty');

        $occupiedRooms = min($totalRooms, $occupiedRooms);

        return [
            'total_rooms' => $totalRooms,
            'occupied_rooms' => $occupiedRooms,
            'available_rooms' => max(0, $totalRooms - $occupiedRooms),
        ];
    }
}
