<?php

namespace Database\Seeders;

use App\Models\BedType;
use App\Models\Hotel;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RemapRoomTypesSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypesConfig = [
            'Standard' => ['adult' => 1, 'child' => 0, 'bed' => 'Single Bed', 'price' => 350000],
            'Superior' => ['adult' => 2, 'child' => 1, 'bed' => 'Twin Bed', 'price' => 750000],
            'Deluxe' => ['adult' => 2, 'child' => 1, 'bed' => 'Queen Bed', 'price' => 1200000],
            'Junior Suite' => ['adult' => 2, 'child' => 2, 'bed' => 'King Bed', 'price' => 2000000],
            'Suite' => ['adult' => 2, 'child' => 2, 'bed' => 'Super King Bed', 'price' => 3500000],
            'Presidential Suite' => ['adult' => 2, 'child' => 2, 'bed' => 'Super King Bed', 'price' => 6000000],
        ];

        $starMultipliers = [1 => 0.8, 2 => 1.0, 3 => 1.4, 4 => 2.0, 5 => 3.0];

        Hotel::chunk(50, function ($hotels) use ($roomTypesConfig, $starMultipliers) {
            foreach ($hotels as $hotel) {
                // Hapus kamar lama agar bisa dibuat ulang dengan variasi yang benar
                $hotel->roomTypes()->each(function ($room) {
                    RoomPhoto::where('room_type_id', $room->id)->delete();
                    $room->delete();
                });
                BedType::where('hotel_id', $hotel->id)->delete();

                $star = (int)($hotel->star_rating ?? 1);
                $multiplier = $starMultipliers[$star] ?? 1.0;

                $keys = array_keys($roomTypesConfig);
                shuffle($keys);
                $selectedKeys = array_slice($keys, 0, rand(3, 6));

                foreach ($selectedKeys as $typeName) {
                    $cfg = $roomTypesConfig[$typeName];
                    
                    $bedType = BedType::create([
                        'hotel_id' => $hotel->id,
                        'name' => $cfg['bed'],
                        'max_adults' => $cfg['adult'],
                        'max_children' => $cfg['child'],
                        'max_total' => $cfg['adult'] + $cfg['child'],
                        'status' => 'active'
                    ]);

                    $base = rand($cfg['price'], $cfg['price'] + 300000);
                    $noise = rand(900, 1100) / 1000;
                    $finalPrice = (int)($base * $multiplier * $noise);

                    RoomType::create([
                        'hotel_id' => $hotel->id,
                        'bed_type_id' => $bedType->id,
                        'name' => $typeName,
                        'description' => "Kamar {$typeName} yang nyaman di {$hotel->name}",
                        'weekday_price' => $finalPrice,
                        'weekend_price' => (int)($finalPrice * 1.2),
                        'stock' => rand(3, 10),
                        'capacity_adult' => $cfg['adult'],
                        'capacity_child' => $cfg['child'],
                        'bed_count' => 1,
                        'is_active' => true
                    ]);
                }
            }
        });
    }
}
