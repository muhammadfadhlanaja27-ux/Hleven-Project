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
            ['name' => 'Bar & Lounge', 'category' => 'Hotel', 'icon' => 'local_bar'],
            ['name' => 'Kafe', 'category' => 'Hotel', 'icon' => 'local_cafe'],
            ['name' => 'Pusat Bisnis', 'category' => 'Hotel', 'icon' => 'business_center'],
            ['name' => 'Ruang Serbaguna', 'category' => 'Hotel', 'icon' => 'meeting_room'],
            ['name' => 'Akses Kursi Roda', 'category' => 'Hotel', 'icon' => 'accessible'],
            ['name' => 'Area Merokok', 'category' => 'Hotel', 'icon' => 'smoking_rooms'],
            ['name' => 'ATM', 'category' => 'Hotel', 'icon' => 'local_atm'],
            ['name' => 'Minimarket', 'category' => 'Hotel', 'icon' => 'local_convenience_store'],
            ['name' => 'Sauna', 'category' => 'Hotel', 'icon' => 'hot_tub'],
            ['name' => 'Jacuzzi', 'category' => 'Hotel', 'icon' => 'hot_tub'],
            ['name' => 'Kolam Renang Anak', 'category' => 'Hotel', 'icon' => 'pool'],
            ['name' => 'Tenis Meja', 'category' => 'Hotel', 'icon' => 'sports_tennis'],
            ['name' => 'Billiard', 'category' => 'Hotel', 'icon' => 'sports_bar'],
            ['name' => 'Area BBQ', 'category' => 'Hotel', 'icon' => 'outdoor_grill'],
            ['name' => 'Rooftop', 'category' => 'Hotel', 'icon' => 'deck'],
            ['name' => 'Parkir Valet', 'category' => 'Hotel', 'icon' => 'local_parking'],
            ['name' => 'Pengisian Daya EV', 'category' => 'Hotel', 'icon' => 'ev_station'],
            ['name' => 'Penyewaan Sepeda', 'category' => 'Hotel', 'icon' => 'pedal_bike'],
            ['name' => 'Layanan Setrika', 'category' => 'Hotel', 'icon' => 'iron'],
            ['name' => 'Kotak P3K', 'category' => 'Hotel', 'icon' => 'medical_services'],
            ['name' => 'Detektor Asap', 'category' => 'Hotel', 'icon' => 'detector_smoke'],
            ['name' => 'Pemadam Kebakaran', 'category' => 'Hotel', 'icon' => 'fire_extinguisher'],
            ['name' => 'Penitipan Barang', 'category' => 'Hotel', 'icon' => 'luggage'],
            ['name' => 'Musholla', 'category' => 'Hotel', 'icon' => 'mosque'],

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
            ['name' => 'Smart TV', 'category' => 'Room', 'icon' => 'tv'],
            ['name' => 'Minibar', 'category' => 'Room', 'icon' => 'kitchen'],
            ['name' => 'Mesin Kopi', 'category' => 'Room', 'icon' => 'coffee_maker'],
            ['name' => 'Teh & Kopi Gratis', 'category' => 'Room', 'icon' => 'emoji_food_beverage'],
            ['name' => 'Pemandangan Kota', 'category' => 'Room', 'icon' => 'location_city'],
            ['name' => 'Pemandangan Laut', 'category' => 'Room', 'icon' => 'waves'],
            ['name' => 'Pemandangan Gunung', 'category' => 'Room', 'icon' => 'landscape'],
            ['name' => 'Pemandangan Taman', 'category' => 'Room', 'icon' => 'park'],
            ['name' => 'Teras', 'category' => 'Room', 'icon' => 'deck'],
            ['name' => 'Dapur Kecil', 'category' => 'Room', 'icon' => 'kitchen'],
            ['name' => 'Microwave', 'category' => 'Room', 'icon' => 'microwave'],
            ['name' => 'Peralatan Makan', 'category' => 'Room', 'icon' => 'restaurant'],
            ['name' => 'Mesin Cuci', 'category' => 'Room', 'icon' => 'local_laundry_service'],
            ['name' => 'Setrika', 'category' => 'Room', 'icon' => 'iron'],
            ['name' => 'Sandal Kamar', 'category' => 'Room', 'icon' => 'checkroom'],
            ['name' => 'Jubah Mandi', 'category' => 'Room', 'icon' => 'dry_cleaning'],
            ['name' => 'Cermin', 'category' => 'Room', 'icon' => 'crop_portrait'],
            ['name' => 'Meja Rias', 'category' => 'Room', 'icon' => 'desk'],
            ['name' => 'Sofa Bed', 'category' => 'Room', 'icon' => 'bed'],
            ['name' => 'Lampu Baca', 'category' => 'Room', 'icon' => 'light'],
            ['name' => 'Colokan Listrik', 'category' => 'Room', 'icon' => 'power'],
            ['name' => 'Pengisi Daya USB', 'category' => 'Room', 'icon' => 'usb'],
            ['name' => 'Kipas Angin', 'category' => 'Room', 'icon' => 'mode_fan'],
            ['name' => 'Kamar Bebas Rokok', 'category' => 'Room', 'icon' => 'smoke_free'],

            // ===== Bathroom Facilities =====
            ['name' => 'Water Heater', 'category' => 'Bathroom', 'icon' => 'thermostat'],
            ['name' => 'Shower', 'category' => 'Bathroom', 'icon' => 'shower'],
            ['name' => 'Peralatan Mandi Gratis', 'category' => 'Bathroom', 'icon' => 'bathtub'],
            ['name' => 'Handuk', 'category' => 'Bathroom', 'icon' => 'dry_cleaning'],
            ['name' => 'Bidet', 'category' => 'Bathroom', 'icon' => 'wash'],
            ['name' => 'Shower Air Panas', 'category' => 'Bathroom', 'icon' => 'shower'],
            ['name' => 'Rain Shower', 'category' => 'Bathroom', 'icon' => 'shower'],
            ['name' => 'Wastafel', 'category' => 'Bathroom', 'icon' => 'wash'],
            ['name' => 'Toilet', 'category' => 'Bathroom', 'icon' => 'wc'],
            ['name' => 'Sampo', 'category' => 'Bathroom', 'icon' => 'soap'],
            ['name' => 'Sabun', 'category' => 'Bathroom', 'icon' => 'soap'],
            ['name' => 'Kondisioner', 'category' => 'Bathroom', 'icon' => 'soap'],
            ['name' => 'Sikat Gigi & Pasta Gigi', 'category' => 'Bathroom', 'icon' => 'cleaning_services'],
            ['name' => 'Cermin Rias', 'category' => 'Bathroom', 'icon' => 'crop_portrait'],
            ['name' => 'Exhaust Fan', 'category' => 'Bathroom', 'icon' => 'mode_fan'],
            ['name' => 'Tisu Toilet', 'category' => 'Bathroom', 'icon' => 'receipt_long'],
            ['name' => 'Rak Handuk', 'category' => 'Bathroom', 'icon' => 'dry_cleaning'],
        ];

        foreach ($facilities as $facility) {
            Facility::updateOrCreate(
                [
                    'hotel_id' => null,
                    'name' => $facility['name'],
                    'category' => $facility['category'],
                ],
                [
                    'icon' => $facility['icon'],
                    'status' => 'active',
                ]
            );
        }
    }
}
