<?php

namespace Database\Seeders;

use App\Models\RoomType;
use App\Models\Hotel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateRoomPricesSeeder extends Seeder
{
    public function run(): void
    {
        $roomRanges = [
            'Standard' => [350000, 750000],
            'Superior' => [750001, 1200000],
            'Deluxe' => [1200001, 2000000],
            'Junior Suite' => [2000001, 3500000],
            'Suite' => [3500001, 6000000],
            'Presidential Suite' => [6000001, 12000000],
        ];

        $starMultipliers = [1 => 0.8, 2 => 1.0, 3 => 1.4, 4 => 2.0, 5 => 3.0];

        RoomType::chunk(100, function ($rooms) use ($roomRanges, $starMultipliers) {
            foreach ($rooms as $room) {
                $hotel = $room->hotel;
                $star = (int)($hotel->star_rating ?? 1);
                $multiplier = $starMultipliers[$star] ?? 1.0;

                $typeName = $room->name;
                $range = $roomRanges[$typeName] ?? [500000, 1000000];
                
                // Base random
                $base = rand($range[0], $range[1]);
                // Apply multiplier and random noise (0.9 to 1.1)
                $noise = rand(900, 1100) / 1000;
                $finalPrice = (int)($base * $multiplier * $noise);

                $room->update([
                    'weekday_price' => $finalPrice,
                    'weekend_price' => (int)($finalPrice * 1.2)
                ]);
            }
        });
    }
}
