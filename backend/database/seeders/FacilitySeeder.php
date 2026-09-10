<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            // ===== Hotel Facilities =====
            ['name' => 'Wi-Fi', 'category' => 'Hotel'],
            ['name' => 'Kolam Renang', 'category' => 'Hotel'],
            ['name' => 'Parkir', 'category' => 'Hotel'],
            ['name' => 'Restoran', 'category' => 'Hotel'],
            ['name' => 'Gym', 'category' => 'Hotel'],
            ['name' => 'Spa', 'category' => 'Hotel'],
            ['name' => 'Resepsionis 24 Jam', 'category' => 'Hotel'],
            ['name' => 'Lift', 'category' => 'Hotel'],
            ['name' => 'Laundry', 'category' => 'Hotel'],
            ['name' => 'AC Area Umum', 'category' => 'Hotel'],

            // ===== Room Facilities =====
            ['name' => 'AC', 'category' => 'Room'],
            ['name' => 'TV', 'category' => 'Room'],
            ['name' => 'Kamar Mandi Pribadi', 'category' => 'Room'],
            ['name' => 'Bathtub', 'category' => 'Room'],
            ['name' => 'Balkon', 'category' => 'Room'],
            ['name' => 'Mini Fridge', 'category' => 'Room'],
            ['name' => 'Hair Dryer', 'category' => 'Room'],
            ['name' => 'Meja Kerja', 'category' => 'Room'],
            ['name' => 'Lemari', 'category' => 'Room'],
            ['name' => 'Air Mineral', 'category' => 'Room'],

            // ===== Bathroom Facilities (tetap dipertahankan) =====
            ['name' => 'Water Heater', 'category' => 'Bathroom'],
            ['name' => 'Shower', 'category' => 'Bathroom'],
            ['name' => 'Peralatan Mandi Gratis', 'category' => 'Bathroom'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate(['name' => $facility['name']], $facility);
        }
    }
}