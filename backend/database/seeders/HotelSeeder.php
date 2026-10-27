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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class HotelSeeder extends Seeder
{
    private $pixabayKey = '58248462-2d21b540c93700d46ff10741e';
    private $exteriorPhotos = [];
    private $roomPhotos = [];

    public function run(): void
    {
        // 1. Fetch Images from Pixabay at start with more keywords
        $this->exteriorPhotos = $this->fetchPixabayImages('luxury hotel exterior, modern resort lobby, boutique hotel garden, skyscraper hotel');
        $this->roomPhotos = $this->fetchPixabayImages('hotel room interior, cozy bedroom hotel, luxury hotel suite, hotel bathroom interior');

        $brands = ['Aston', 'Santika', 'Ibis', 'Harris', 'Swiss-Belhotel', 'Amaris', 'Favehotel', 'Novotel', 'Mercure', 'Pullman'];
        $suffixes = ['Prime', 'Grand', 'Heritage', 'Resort', 'Suites', 'Boutique', 'Express', 'Palace', 'Garden'];
        $roomNames = [
            ['name' => 'Superior Room', 'level' => 'standard'],
            ['name' => 'Deluxe Room', 'level' => 'deluxe'],
            ['name' => 'Executive Suite', 'level' => 'deluxe'],
            ['name' => 'Junior Suite', 'level' => 'luxury'],
            ['name' => 'Family Studio', 'level' => 'luxury'],
            ['name' => 'Presidential Suite', 'level' => 'luxury']
        ];
        
        $cities = City::all();
        $password = Hash::make('adminhotel');
        $hotelFacilities = Facility::where('category', 'Hotel')->get();
        $roomFacilities = Facility::where('category', 'Room')->get();
        $bathroomFacilities = Facility::where('category', 'Bathroom')->get();

        $usedHotelNames = [];

        foreach ($cities as $city) {
            $count = rand(3, 5);
            for ($i = 0; $i < $count; $i++) {
                $isTransLuxury = ($city->city === 'Bandung' && $i === 0);
                
                if ($isTransLuxury) {
                    $name = 'The Trans Luxury Hotel Bandung';
                    $star = 5;
                    $lat = -6.924825;
                    $lng = 107.636412;
                    $addr = 'Jl. Gatot Subroto No.289, Bandung';
                } else {
                    $brand = $brands[array_rand($brands)];
                    $suffix = $suffixes[array_rand($suffixes)];
                    $name = $brand . ' ' . $suffix . ' ' . $city->city;
                    
                    $attempt = 1;
                    $baseName = $name;
                    while (in_array($name, $usedHotelNames)) {
                        $name = $baseName . ' ' . (++$attempt);
                    }

                    $star = rand(2, 5);
                    $lat = -6.2000 + (rand(-15000, 15000) / 1000); 
                    $lng = 106.8166 + (rand(-15000, 15000) / 1000);
                    $addr = "Jl. Utama " . $city->city . " No. " . rand(1, 100);
                }

                $usedHotelNames[] = $name;
                $slug = Str::slug($name) . '-' . Str::random(5);

                $admin = User::create([
                    'name' => 'Admin ' . $name,
                    'email' => Str::slug($name) . rand(1000, 9999) . '@gmail.com',
                    'password' => $password,
                    'role' => 'admin_hotel',
                    'status' => 'active',
                    'phone' => '08' . rand(1000000000, 9999999999),
                ]);

                $hotel = Hotel::create([
                    'admin_id' => $admin->id,
                    'city_id' => $city->id,
                    'name' => $name,
                    'slug' => $slug,
                    'description' => "Pengalaman menginap luar biasa di {$name}, destinasi terbaik di {$city->city} dengan fasilitas premium dan pelayanan ramah.",
                    'address' => $addr,
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'star_rating' => $star,
                    'status' => 'active',
                    'policies' => "Kebijakan Anak:\n- Anak di bawah 12 tahun gratis dengan tempat tidur yang ada.\n- Usia 12+ dianggap dewasa.\n- Breakfast anak dikenakan biaya 50% dari harga dewasa.",
                ]);

                $hotel->facilities()->sync($hotelFacilities->random(min(5, $hotelFacilities->count()))->pluck('id'));

                // Add 3 Hotel Photos (1 primary + 2 gallery)
                $photoCount = rand(2, 3);
                for ($p = 0; $p < $photoCount; $p++) {
                    $photoUrl = $this->getPhotoFromPool('exterior', $hotel->id + $p);
                    HotelPhoto::create([
                        'hotel_id' => $hotel->id,
                        'photo' => $photoUrl,
                        'is_thumbnail' => ($p === 0),
                    ]);
                }

                // Add Room Types (4-6 per hotel)
                $roomCount = rand(4, 6);
                for ($r = 0; $r < $roomCount; $r++) {
                    $roomInfo = $roomNames[$r % count($roomNames)];
                    $roomName = $roomInfo['name'];
                    
                    $basePrice = $this->getBasePrice($star);
                    $price = $basePrice + ($r * 150000);

                    $roomType = RoomType::create([
                        'hotel_id' => $hotel->id,
                        'name' => $roomName,
                        'description' => "Nikmati kenyamanan maksimal di {$roomName} kami yang telah dilengkapi dengan fasilitas modern, desain interior elegan, dan tempat tidur berkualitas tinggi.",
                        'weekday_price' => $price,
                        'weekend_price' => $price + 200000,
                        'stock' => rand(5, 15),
                        'capacity_adult' => in_array($roomName, ['Superior Room', 'Deluxe Room']) ? 1 : 2,
                        'capacity_child' => 1,
                        'breakfast' => ($star >= 3),
                        'smoking_area' => (rand(0, 1) === 1),
                        'is_refundable' => ($star >= 4),
                        'is_active' => true,
                    ]);

                    $roomType->facilities()->sync($roomFacilities->random(min(5, $roomFacilities->count()))->pluck('id')->merge($bathroomFacilities->random(min(3, $bathroomFacilities->count()))->pluck('id')));

                    $roomPhotoUrl = $this->getPhotoFromPool('room', $roomType->id);
                    RoomPhoto::create([
                        'room_type_id' => $roomType->id,
                        'photo' => $roomPhotoUrl,
                        'is_thumbnail' => true,
                    ]);
                }
            }
        }
    }

    private function fetchPixabayImages($query)
    {
        try {
            $responses = [];
            // Multiple keywords to get more variety
            $keywords = explode(', ', $query);
            foreach ($keywords as $kw) {
                $response = Http::get('https://pixabay.com/api/', [
                    'key' => $this->pixabayKey,
                    'q' => $kw,
                    'image_type' => 'photo',
                    'orientation' => 'horizontal',
                    'per_page' => 100,
                    'safesearch' => 'true'
                ]);
                if ($response->successful()) {
                    $responses = array_merge($responses, collect($response->json()['hits'])->pluck('largeImageURL')->toArray());
                }
            }
            return array_unique($responses);
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getPhotoFromPool($type, $seedId)
    {
        $pool = ($type === 'exterior') ? $this->exteriorPhotos : $this->roomPhotos;

        if (empty($pool)) {
            // Fallback to Picsum
            return "https://picsum.photos/seed/hleven-{$type}-{$seedId}/1200/800";
        }

        // Return random image from pool
        return $pool[array_rand($pool)];
    }

    private function getBasePrice($starRating)
    {
        switch ($starRating) {
            case 5: return rand(1500000, 3000000);
            case 4: return rand(800000, 1400000);
            case 3: return rand(450000, 750000);
            case 2: return rand(250000, 400000);
            default: return 200000;
        }
    }
}
