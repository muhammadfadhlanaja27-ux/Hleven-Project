<?php

namespace Database\Seeders;

use App\Models\BedType;
use App\Models\City;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\Review;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class DataGeneratorSeeder extends Seeder
{
    private $pixabayKey = '58248462-2d21b540c93700d46ff10741e';

    private function fetchImages($query, $count)
    {
        try {
            $response = Http::get('https://pixabay.com/api/', [
                'key' => $this->pixabayKey,
                'q' => $query,
                'image_type' => 'photo',
                'orientation' => 'horizontal',
                'per_page' => $count,
            ]);
            return $response->successful() ? collect($response->json()['hits'])->pluck('largeImageURL')->toArray() : ["https://picsum.photos/800/600"];
        } catch (\Exception $e) { return ["https://picsum.photos/800/600"]; }
    }

    public function run(): void
    {
        $filePath = database_path('data/hotels.csv');
        if (!file_exists($filePath)) return;

        $csv = array_map('str_getcsv', file($filePath));
        array_shift($csv); 

        $roomTypesConfig = [
            'Standard' => ['adult' => 1, 'child' => 0, 'bed' => 'Single Bed', 'price' => 300000],
            'Superior' => ['adult' => 2, 'child' => 1, 'bed' => 'Twin Bed', 'price' => 500000],
            'Deluxe' => ['adult' => 2, 'child' => 1, 'bed' => 'Queen Bed', 'price' => 800000],
            'Junior Suite' => ['adult' => 2, 'child' => 2, 'bed' => 'King Bed', 'price' => 1200000],
            'Suite' => ['adult' => 2, 'child' => 2, 'bed' => 'Super King Bed', 'price' => 1800000],
            'Presidential Suite' => ['adult' => 2, 'child' => 2, 'bed' => 'Super King Bed', 'price' => 3000000],
        ];

        $reviewTexts = [
            "Hotelnya nyaman banget, lokasi strategis dan pelayanannya ramah. Bakal balik lagi sih!",
            "Lumayan buat transit, tapi sayangnya sarapannya kurang bervariasi.",
            "Kamar bersih, AC dingin. Sangat recommended buat liburan keluarga.",
            "Tempatnya aesthetic, cocok buat foto-foto. Harga oke banget.",
            "Pelayanan lambat saat check-in, tapi kamarnya oke sih.",
            "Lokasi di tengah kota, gampang cari makan. Bakal ke sini lagi kalau ada urusan.",
            "Sayangnya parkir agak sempit, selebihnya oke.",
            "Super cozy! Betah banget di sini lama-lama.",
            "Harga murah tapi fasilitas mewah, worth it banget!",
            "B aja sih, standar hotel pada umumnya."
        ];

        $hotelPhotos = $this->fetchImages('luxury hotel exterior lobby', 20);
        $roomPhotos = $this->fetchImages('hotel room interior bed', 20);

        foreach ($csv as $index => $row) {
            if (count($row) < 3) continue;
            
            DB::transaction(function () use ($row, $roomTypesConfig, $reviewTexts, $hotelPhotos, $roomPhotos) {
                $cityName = $row[0];
                $hotelName = $row[1];
                $star = (int)$row[2];
                $address = $row[3] ?? 'Alamat tidak tersedia';

                $city = City::firstOrCreate(['city' => $cityName], ['province' => 'Indonesia']);
                
                $user = User::create([
                    'name' => $hotelName,
                    'email' => Str::slug($hotelName) . rand(1000, 9999) . '@hleven.com',
                    'password' => Hash::make('adminhotel'),
                    'role' => 'admin_hotel',
                    'status' => 'active'
                ]);

                $hotel = Hotel::create([
                    'admin_id' => $user->id,
                    'city_id' => $city->id,
                    'name' => $hotelName,
                    'slug' => Str::slug($hotelName) . '-' . Str::random(5),
                    'address' => $address,
                    'star_rating' => $star,
                    'status' => 'active'
                ]);

                // Hotel Photos
                for ($i = 0; $i < rand(5, 8); $i++) {
                    HotelPhoto::create([
                        'hotel_id' => $hotel->id,
                        'photo' => $hotelPhotos[array_rand($hotelPhotos)],
                        'is_thumbnail' => ($i === 0)
                    ]);
                }

                // Reviews
                for ($i = 0; $i < rand(5, 10); $i++) {
                    Review::create([
                        'hotel_id' => $hotel->id,
                        'user_id' => User::inRandomOrder()->first()->id,
                        'rating' => rand(3, 5),
                        'comment' => $reviewTexts[array_rand($reviewTexts)]
                    ]);
                }

                // Rooms
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

                    $room = RoomType::create([
                        'hotel_id' => $hotel->id,
                        'bed_type_id' => $bedType->id,
                        'name' => $typeName,
                        'description' => "Kamar {$typeName} yang nyaman di {$hotel->name}",
                        'weekday_price' => $cfg['price'],
                        'weekend_price' => $cfg['price'] * 1.2,
                        'stock' => rand(3, 10),
                        'capacity_adult' => $cfg['adult'],
                        'capacity_child' => $cfg['child'],
                        'bed_count' => 1,
                        'is_active' => true
                    ]);

                    // Room Photos
                    for ($j = 0; $j < rand(4, 6); $j++) {
                        RoomPhoto::create([
                            'room_type_id' => $room->id,
                            'photo' => $roomPhotos[array_rand($roomPhotos)],
                            'is_thumbnail' => ($j === 0)
                        ]);
                    }
                }
            });

            if ($index % 50 == 0) echo "Processed {$index} hotels...\n";
        }
        echo "Seeding completed!\n";
    }
}
