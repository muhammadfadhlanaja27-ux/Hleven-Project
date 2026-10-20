<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Facility;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DummyHotelSeeder extends Seeder
{
    public function run(): void
    {
        $facilityByName = Facility::pluck('id', 'name')->toArray();
        $idsFor = function (array $names) use ($facilityByName) {
            $ids = [];
            foreach ($names as $n) {
                if (isset($facilityByName[$n])) $ids[] = $facilityByName[$n];
            }
            return array_values(array_unique($ids));
        };

        $bandungId = City::where('city', 'Bandung')->value('id');
        $jakartaId = City::where('city', 'Jakarta Pusat')->value('id');
        $denpasarId = City::where('city', 'Denpasar')->value('id');
        $fallbackCity = City::pluck('id')->first();
        $superAdminId = User::where('role', 'super_admin')->value('id');

        $hotelMeta = [
            // Bandung (7)
            ['name' => 'Trans Luxury Bandung', 'city' => 'bandung', 'address' => 'Jl. Gatot Subroto No. 289, Cibangkong, Bandung', 'lat' => -6.9261, 'lng' => 107.5890, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Crowne Plaza Bandung', 'city' => 'bandung', 'address' => 'Jl. Lungaran Lembang No. 198, Bandung', 'lat' => -6.9009, 'lng' => 107.6130, 'tier' => 'resort', 'star' => 5],
            ['name' => 'The Papandayan Bandung', 'city' => 'bandung', 'address' => 'Jl. Gatot Subroto No. 7, Bandung', 'lat' => -6.9225, 'lng' => 107.5930, 'tier' => 'resort', 'star' => 4],
            ['name' => 'Mercure Bandung City Centre', 'city' => 'bandung', 'address' => 'Jl. Dr. Djunjunan No. 62, Bandung', 'lat' => -6.9175, 'lng' => 107.6190, 'tier' => 'city', 'star' => 4],
            ['name' => 'Grand Savoy Homann Bandung', 'city' => 'bandung', 'address' => 'Jl. Asia Afrika No. 112, Bandung', 'lat' => -6.9175, 'lng' => 107.6090, 'tier' => 'heritage', 'star' => 4],
            ['name' => 'Hotel Savoy Homann Bandung', 'city' => 'bandung', 'address' => 'Jl. Asia Afrika No. 112, Bandung', 'lat' => -6.9175, 'lng' => 107.6090, 'tier' => 'heritage', 'star' => 4],
            ['name' => 'Ibis Bandung Trans Studio', 'city' => 'bandung', 'address' => 'Jl. Gatot Subroto No. 289, Bandung', 'lat' => -6.9261, 'lng' => 107.5890, 'tier' => 'city', 'star' => 3],
            // Jakarta (7)
            ['name' => 'The St. Regis Jakarta', 'city' => 'jakarta', 'address' => 'Jl. DR. Ide Anak Agung Gde Agung Lot 5.1-5.2, Jakarta Selatan', 'lat' => -6.2910, 'lng' => 106.8270, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Swissôtel Jakarta PIK Avenue', 'city' => 'jakarta', 'address' => 'Jl. Pantai Indah Kapuk, Jakarta Utara', 'lat' => -6.1090, 'lng' => 106.7410, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Hotel Mulia Jakarta', 'city' => 'jakarta', 'address' => 'Jl. Asia Afrika No. 8, Jakarta Pusat', 'lat' => -6.1925, 'lng' => 106.8230, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Aloft Jakarta Wahid Hasyim', 'city' => 'jakarta', 'address' => 'Jl. K. H. Wahid Hasyim No. 712, Jakarta Pusat', 'lat' => -6.1940, 'lng' => 106.8160, 'tier' => 'city', 'star' => 4],
            ['name' => 'Ashley Wahid Hasyim', 'city' => 'jakarta', 'address' => 'Jl. K. H. Wahid Hasyim No. 693, Jakarta Pusat', 'lat' => -6.1945, 'lng' => 106.8165, 'tier' => 'city', 'star' => 4],
            ['name' => 'Harris Vertu Harmoni', 'city' => 'jakarta', 'address' => 'Jl. Hayam Wuruk No. 72, Jakarta Pusat', 'lat' => -6.1650, 'lng' => 106.8330, 'tier' => 'city', 'star' => 4],
            ['name' => 'Ibis Cipete Jakarta', 'city' => 'jakarta', 'address' => 'Jl. Cipete Raya No. 16, Jakarta Selatan', 'lat' => -6.2630, 'lng' => 106.7970, 'tier' => 'city', 'star' => 3],
            // Bali (6)
            ['name' => 'Nusa Dua Beach Resort Bali', 'city' => 'denpasar', 'address' => 'Kawasan Pariwisata Nusa Dua, Badung, Bali', 'lat' => -8.8000, 'lng' => 115.2270, 'tier' => 'resort', 'star' => 5],
            ['name' => 'The St. Regis Bali Resort', 'city' => 'denpasar', 'address' => 'Kawasan Nusa Dua, Badung, Bali', 'lat' => -8.8010, 'lng' => 115.2280, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Sofitel Bali Nusa Dua', 'city' => 'denpasar', 'address' => 'Kawasan ITDC Nusa Dua, Badung, Bali', 'lat' => -8.7980, 'lng' => 115.2290, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Harris Hotel & Residences Kuta', 'city' => 'denpasar', 'address' => 'Jl. Poppies Lane II, Kuta, Badung, Bali', 'lat' => -8.7200, 'lng' => 115.1690, 'tier' => 'city', 'star' => 4],
            ['name' => 'The Westin Resort Nusa Dua', 'city' => 'denpasar', 'address' => 'Kawasan ITDC Nusa Dua, Badung, Bali', 'lat' => -8.7980, 'lng' => 115.2290, 'tier' => 'resort', 'star' => 5],
            ['name' => 'Padma Resort Legian', 'city' => 'denpasar', 'address' => 'Jl. Padma No. 1, Legian, Badung, Bali', 'lat' => -8.7070, 'lng' => 115.1680, 'tier' => 'resort', 'star' => 4],
        ];
        $cityMap = ['bandung' => $bandungId, 'jakarta' => $jakartaId, 'denpasar' => $denpasarId];

        $hotelFacByTier = [
            'resort' => ['Wi-Fi', 'Kolam Renang', 'Parkir', 'Restoran', 'Spa', 'Resepsionis 24 Jam', 'Laundry'],
            'city' => ['Wi-Fi', 'Parkir', 'Restoran', 'Gym', 'Resepsionis 24 Jam', 'Lift', 'Laundry', 'AC Area Umum'],
            'heritage' => ['Wi-Fi', 'Parkir', 'Restoran', 'Resepsionis 24 Jam', 'Laundry', 'AC Area Umum'],
        ];
        // Harga = rate real Booking.com per kota (weekday, weekend = +30%)
        $priceMap = [
            'bandung' => [[550000, 715000], [775000, 1007500], [1100000, 1430000], [1586000, 2061800], [2146000, 2789800], [2280000, 2964000]],
            'jakarta' => [[1035000, 1345500], [1166000, 1515800], [1210000, 1573000], [2465000, 3204500], [3063000, 3981900], [4350000, 5655000]],
            'denpasar' => [[638000, 829400], [668000, 868400], [855000, 1111500], [1980000, 2574000], [2600000, 3380000], [3220000, 4186000]],
        ];
        $deluxeBase = ['AC', 'TV', 'Kamar Mandi Pribadi', 'Shower', 'Air Mineral', 'Meja Kerja', 'Lemari'];
        $deluxeExtras = [['Hair Dryer'], ['Water Heater'], ['Hair Dryer', 'Water Heater']];
        $suiteBase = ['AC', 'TV', 'Kamar Mandi Pribadi', 'Bathtub', 'Balkon', 'Mini Fridge', 'Hair Dryer', 'Air Mineral'];
        $suiteExtras = [['Water Heater'], ['Peralatan Mandi Gratis'], ['Water Heater', 'Peralatan Mandi Gratis']];

        $hotelPhotos = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        ];
        $deluxePhotos = [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        ];
        $suitePhotos = [
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        ];

        for ($i = 1; $i <= 20; $i++) {
            $email = sprintf('hotel%02d@hleven.com', $i);

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => "Admin Hotel $i",
                    'role' => 'admin_hotel',
                    'password' => Hash::make('adminhotel'),
                    'phone' => '0812' . str_pad((string) rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            $meta = $hotelMeta[$i - 1] ?? ['name' => "Hotel $i", 'city' => 'bandung', 'address' => "Jl. Dago No. $i, Bandung", 'lat' => -6.9039, 'lng' => 107.6186, 'tier' => 'city'];
            $cityId = $cityMap[$meta['city']] ?? $fallbackCity;
            $hotelName = $meta['name'];
            $slug = Str::slug($hotelName) . '-dummy-' . $i;

            $hotel = Hotel::updateOrCreate(
                ['slug' => $slug],
                [
                    'admin_id' => $user->id,
                    'city_id' => $cityId,
                    'name' => $hotelName,
                    'description' => fake()->paragraph(3) . ' Fasilitas lengkap dan lokasi strategis di pusat kota.',
                    'address' => $meta['address'],
                    'average_rating' => 0,
                    'total_review' => 0,
                    'latitude' => $meta['lat'],
                    'longitude' => $meta['lng'],
                    'status' => 'active',
                    'star_rating' => $meta['star'] ?? 3,
                    'star_verified_by' => $superAdminId,
                    'star_verified_at' => now(),
                    'star_verified_reason' => 'Verifikasi otomatis hotel resmi',
                ]
            );

            $hotel->facilities()->sync($idsFor($hotelFacByTier[$meta['tier']] ?? $hotelFacByTier['city']));

            if ($hotel->photos()->count() === 0) {
                $thumb = $hotelPhotos[($i - 1) % count($hotelPhotos)];
                $second = $hotelPhotos[$i % count($hotelPhotos)];
                HotelPhoto::create(['hotel_id' => $hotel->id, 'photo' => $thumb, 'is_thumbnail' => true]);
                HotelPhoto::create(['hotel_id' => $hotel->id, 'photo' => $second, 'is_thumbnail' => false]);
            }

            if ($hotel->roomTypes()->count() > 0) {
                continue;
            }

            $tierPrices = $priceMap[$meta['city']] ?? $priceMap['bandung'];
            $pick = ($i - 1) % 3;
            $deluxePrice = $tierPrices[$pick];
            $suitePrice = $tierPrices[3 + $pick];

            $deluxe = RoomType::create([
                'hotel_id' => $hotel->id,
                'name' => 'Deluxe Room',
                'description' => 'Kamar luas dengan pemandangan kota. Fasilitas modern dan nyaman untuk 2 tamu.',
                'weekday_price' => $deluxePrice[0],
                'weekend_price' => $deluxePrice[1],
                'stock' => 5,
                'capacity_adult' => 2,
                'capacity_child' => 1,
                'breakfast' => true,
                'smoking_area' => false,
            ]);

            RoomPhoto::create([
                'room_type_id' => $deluxe->id,
                'photo' => $deluxePhotos[($i - 1) % count($deluxePhotos)],
                'is_thumbnail' => true,
            ]);

            $deluxe->facilities()->sync($idsFor(array_merge($deluxeBase, $deluxeExtras[($i - 1) % count($deluxeExtras)])));

            $suite = RoomType::create([
                'hotel_id' => $hotel->id,
                'name' => 'Suite Room',
                'description' => 'Kamar mewah fasilitas lengkap dengan ruang tamu terpisah. Cocok untuk keluarga.',
                'weekday_price' => $suitePrice[0],
                'weekend_price' => $suitePrice[1],
                'stock' => 2,
                'capacity_adult' => 3,
                'capacity_child' => 2,
                'breakfast' => true,
                'smoking_area' => false,
            ]);

            RoomPhoto::create([
                'room_type_id' => $suite->id,
                'photo' => $suitePhotos[($i - 1) % count($suitePhotos)],
                'is_thumbnail' => true,
            ]);

            $suite->facilities()->sync($idsFor(array_merge($suiteBase, $suiteExtras[($i - 1) % count($suiteExtras)])));
        }

        $this->command?->info('Dummy hotels seeded: 20 hotels (hotel01..hotel20@hleven.com / adminhotel)');
    }
}
