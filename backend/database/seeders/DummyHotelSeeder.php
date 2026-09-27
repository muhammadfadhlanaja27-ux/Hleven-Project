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
        $hotelFacilities = Facility::where('category', 'Hotel')->pluck('id')->toArray();
        $roomFacilities = Facility::whereIn('category', ['Room', 'Bathroom'])->pluck('id')->toArray();

        $cityIds = [
            City::where('city', 'Bandung')->value('id'),
            City::where('city', 'Jakarta Pusat')->value('id'),
            City::where('city', 'Denpasar')->value('id'),
        ];
        $cityIds = array_values(array_filter($cityIds));
        if (empty($cityIds)) {
            $cityIds = City::pluck('id')->toArray();
        }

        $hotelNames = [
            'Grand Hleven Bandung', 'Hleven Jakarta Central', 'Bali Hleven Resort',
            'Hleven Suites Bandung', 'Jakarta Hleven Heights', 'Hleven Beach Bali',
            'Bandung Hleven Prime', 'Hleven City Jakarta', 'Hleven Ubud Retreat',
            'Hleven Dago Hills', 'Hleven Sudirman Tower', 'Hleven Seminyak Bay',
            'Hleven Lembang Valley', 'Hleven Thamrin Plaza', 'Hleven Canggu Sands',
            'Hleven Braga Heritage', 'Hleven Kemang Residence', 'Hleven Jimbaran Cliff',
            'Hleven Setiabudi Grand', 'Hleven Kuta Paradise',
        ];

        $hotelPhotos = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1551882547-b79c417633b4?auto=format&fit=crop&w=800&q=80',
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

            $cityId = $cityIds[($i - 1) % count($cityIds)];
            $hotelName = $hotelNames[$i - 1] ?? "Hotel $i";
            $slug = Str::slug($hotelName) . '-dummy-' . $i;

            $hotel = Hotel::updateOrCreate(
                ['slug' => $slug],
                [
                    'admin_id' => $user->id,
                    'city_id' => $cityId,
                    'name' => $hotelName,
                    'description' => fake()->paragraph(3) . ' Fasilitas lengkap dan lokasi strategis di pusat kota.',
                    'address' => fake()->streetAddress() . ', ' . fake()->city(),
                    'average_rating' => 0,
                    'total_review' => 0,
                    'latitude' => -6.2 + (rand(-50, 50) / 1000),
                    'longitude' => 106.8 + (rand(-50, 50) / 1000),
                    'status' => 'active',
                ]
            );

            if ($hotel->facilities()->count() === 0 && !empty($hotelFacilities)) {
                $count = rand(2, min(5, count($hotelFacilities)));
                $hotel->facilities()->sync(collect($hotelFacilities)->random($count)->toArray());
            }

            if ($hotel->photos()->count() === 0) {
                $thumb = $hotelPhotos[($i - 1) % count($hotelPhotos)];
                $second = $hotelPhotos[$i % count($hotelPhotos)];
                HotelPhoto::create(['hotel_id' => $hotel->id, 'photo' => $thumb, 'is_thumbnail' => true]);
                HotelPhoto::create(['hotel_id' => $hotel->id, 'photo' => $second, 'is_thumbnail' => false]);
            }

            if ($hotel->roomTypes()->count() > 0) {
                continue;
            }

            $deluxe = RoomType::create([
                'hotel_id' => $hotel->id,
                'name' => 'Deluxe Room',
                'description' => 'Kamar luas dengan pemandangan kota. Fasilitas modern dan nyaman untuk 2 tamu.',
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
                'photo' => $deluxePhotos[($i - 1) % count($deluxePhotos)],
                'is_thumbnail' => true,
            ]);

            if (!empty($roomFacilities)) {
                $count = rand(4, min(6, count($roomFacilities)));
                $deluxe->facilities()->sync(collect($roomFacilities)->random($count)->toArray());
            }

            $suite = RoomType::create([
                'hotel_id' => $hotel->id,
                'name' => 'Suite Room',
                'description' => 'Kamar mewah fasilitas lengkap dengan ruang tamu terpisah. Cocok untuk keluarga.',
                'weekday_price' => 1200000,
                'weekend_price' => 1500000,
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

            if (!empty($roomFacilities)) {
                $count = rand(5, min(7, count($roomFacilities)));
                $suite->facilities()->sync(collect($roomFacilities)->random($count)->toArray());
            }
        }

        $this->command?->info('Dummy hotels seeded: 20 hotels (hotel01..hotel20@hleven.com / adminhotel)');
    }
}
