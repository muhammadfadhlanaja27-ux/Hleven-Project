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
            ['name' => 'Sarapan', 'category' => 'Hotel', 'icon' => 'free_breakfast'],
            ['name' => 'Layanan Kamar', 'category' => 'Hotel', 'icon' => 'room_service'],
            ['name' => 'Keamanan 24 Jam', 'category' => 'Hotel', 'icon' => 'security'],
            ['name' => 'CCTV', 'category' => 'Hotel', 'icon' => 'videocam'],
            ['name' => 'Ruang Meeting', 'category' => 'Hotel', 'icon' => 'meeting_room'],
            ['name' => 'Antar Jemput Bandara', 'category' => 'Hotel', 'icon' => 'airport_shuttle'],
            ['name' => 'Taman', 'category' => 'Hotel', 'icon' => 'park'],
            ['name' => 'Area Bermain Anak', 'category' => 'Hotel', 'icon' => 'child_care'],

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
            ['name' => 'Wi-Fi di Kamar', 'category' => 'Room', 'icon' => 'wifi'],
            ['name' => 'Ketel Listrik', 'category' => 'Room', 'icon' => 'coffee_maker'],
            ['name' => 'Brankas Kamar', 'category' => 'Room', 'icon' => 'lock'],
            ['name' => 'Telepon', 'category' => 'Room', 'icon' => 'phone'],
            ['name' => 'Kedap Suara', 'category' => 'Room', 'icon' => 'volume_off'],
            ['name' => 'Tirai Blackout', 'category' => 'Room', 'icon' => 'curtains'],
            ['name' => 'Sofa', 'category' => 'Room', 'icon' => 'chair'],

            // ===== Bathroom Facilities (tetap dipertahankan) =====
            ['name' => 'Water Heater', 'category' => 'Bathroom', 'icon' => 'thermostat'],
            ['name' => 'Shower', 'category' => 'Bathroom', 'icon' => 'shower'],
            ['name' => 'Peralatan Mandi Gratis', 'category' => 'Bathroom', 'icon' => 'bathtub'],
            ['name' => 'Handuk', 'category' => 'Bathroom', 'icon' => 'dry_cleaning'],
            ['name' => 'Bidet', 'category' => 'Bathroom', 'icon' => 'wash'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate([
                'name' => $facility['name'],
                'category' => $facility['category'],
            ], $facility);
        }
    }
}
