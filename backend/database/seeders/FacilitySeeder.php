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
            ['name' => 'Sarapan', 'category' => 'Hotel'],
            ['name' => 'Layanan Kamar', 'category' => 'Hotel'],
            ['name' => 'Keamanan 24 Jam', 'category' => 'Hotel'],
            ['name' => 'CCTV', 'category' => 'Hotel'],
            ['name' => 'Ruang Meeting', 'category' => 'Hotel'],
            ['name' => 'Antar Jemput Bandara', 'category' => 'Hotel'],
            ['name' => 'Taman', 'category' => 'Hotel'],
            ['name' => 'Area Bermain Anak', 'category' => 'Hotel'],

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
            ['name' => 'Wi-Fi di Kamar', 'category' => 'Room'],
            ['name' => 'Ketel Listrik', 'category' => 'Room'],
            ['name' => 'Brankas Kamar', 'category' => 'Room'],
            ['name' => 'Telepon', 'category' => 'Room'],
            ['name' => 'Kedap Suara', 'category' => 'Room'],
            ['name' => 'Tirai Blackout', 'category' => 'Room'],
            ['name' => 'Sofa', 'category' => 'Room'],

            // ===== Bathroom Facilities (tetap dipertahankan) =====
            ['name' => 'Water Heater', 'category' => 'Bathroom'],
            ['name' => 'Shower', 'category' => 'Bathroom'],
            ['name' => 'Peralatan Mandi Gratis', 'category' => 'Bathroom'],
            ['name' => 'Handuk', 'category' => 'Bathroom'],
            ['name' => 'Bidet', 'category' => 'Bathroom'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate([
                'name' => $facility['name'],
                'category' => $facility['category'],
            ], $facility);
        }
    }
}
