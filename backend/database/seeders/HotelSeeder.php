<?php

// database/seeders/HotelSeeder.php
namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\RoomPhoto;
use Illuminate\Database\Seeder;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        Hotel::factory(3)->create()->each(function ($hotel) {
            // Buat tipe kamar untuk setiap hotel yang digenerate
            $deluxe = RoomType::create([
                'hotel_id' => $hotel->id,
                'name' => 'Deluxe Room',
                'description' => 'Kamar luas dengan pemandangan kota.',
                'weekday_price' => 500000,
                'weekend_price' => 650000,
                'stock' => 5,
                'capacity_adult' => 2,
                'capacity_child' => 1,
                'breakfast' => true,
                'smoking_area' => false,
            ]);

            RoomPhoto::create([
                'room_type_id' => $deluxe->id,
                'photo' => 'room_types/placeholder_deluxe.jpg',
                'is_thumbnail' => true,
            ]);

            $suite = RoomType::create([
                'hotel_id' => $hotel->id,
                'name' => 'Suite Room',
                'description' => 'Kamar mewah fasilitas lengkap dengan ruang tamu terpisah.',
                'weekday_price' => 1200000,
                'weekend_price' => 1500000,
                'stock' => 2,
                'capacity_adult' => 3,
                'capacity_child' => 2,
                'breakfast' => true,
                'smoking_area' => true,
            ]);

            RoomPhoto::create([
                'room_type_id' => $suite->id,
                'photo' => 'room_types/placeholder_suite.jpg',
                'is_thumbnail' => true,
            ]);
        });
    }
}
