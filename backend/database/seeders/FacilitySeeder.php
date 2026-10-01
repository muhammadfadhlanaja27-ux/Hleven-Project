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
            ['name' => 'Wi-Fi', 'category' => 'Hotel', 'icon' => 'wifi'],
            ['name' => 'Kolam Renang', 'category' => 'Hotel', 'icon' => 'pool'],
            ['name' => 'Parkir', 'category' => 'Hotel', 'icon' => 'local_parking'],
            ['name' => 'Restoran', 'category' => 'Hotel', 'icon' => 'restaurant'],
            ['name' => 'Gym', 'category' => 'Hotel', 'icon' => 'fitness_center'],
            ['name' => 'Spa', 'category' => 'Hotel', 'icon' => 'spa'],
            ['name' => 'Resepsionis 24 Jam', 'category' => 'Hotel', 'icon' => 'concierge'],
            ['name' => 'Lift', 'category' => 'Hotel', 'icon' => 'elevator'],
            ['name' => 'Laundry', 'category' => 'Hotel', 'icon' => 'local_laundry_service'],
            ['name' => 'AC Area Umum', 'category' => 'Hotel', 'icon' => 'ac_unit'],

            // ===== Room Facilities =====
            ['name' => 'AC', 'category' => 'Room', 'icon' => 'ac_unit'],
            ['name' => 'TV', 'category' => 'Room', 'icon' => 'tv'],
            ['name' => 'Kamar Mandi Pribadi', 'category' => 'Room', 'icon' => 'bathtub'],
            ['name' => 'Bathtub', 'category' => 'Room', 'icon' => 'bathtub'],
            ['name' => 'Balkon', 'category' => 'Room', 'icon' => 'balcony'],
            ['name' => 'Mini Fridge', 'category' => 'Room', 'icon' => 'kitchen'],
            ['name' => 'Hair Dryer', 'category' => 'Room', 'icon' => 'air'],
            ['name' => 'Meja Kerja', 'category' => 'Room', 'icon' => 'desk'],
            ['name' => 'Lemari', 'category' => 'Room', 'icon' => 'checkroom'],
            ['name' => 'Air Mineral', 'category' => 'Room', 'icon' => 'water_drop'],

            // ===== Bathroom Facilities (tetap dipertahankan) =====
            ['name' => 'Water Heater', 'category' => 'Bathroom', 'icon' => 'thermostat'],
            ['name' => 'Shower', 'category' => 'Bathroom', 'icon' => 'shower'],
            ['name' => 'Peralatan Mandi Gratis', 'category' => 'Bathroom', 'icon' => 'bathtub'],
        ];

        foreach ($facilities as $facility) {
            Facility::updateOrCreate(['name' => $facility['name']], $facility);
        }
    }
}