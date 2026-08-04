<?php

namespace Database\Seeders;

use App\Models\RoomAvailability;
use App\Models\RoomPhoto;
use App\Models\RoomPriceHistory;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        RoomType::factory(40)->create()->each(function ($room) {

            RoomPhoto::factory(3)->create([
                'room_type_id' => $room->id,
            ]);

            RoomAvailability::factory(30)->create([
                'room_type_id' => $room->id,
            ]);

            RoomPriceHistory::factory()->create([
                'room_type_id' => $room->id,
            ]);

        });
    }
}