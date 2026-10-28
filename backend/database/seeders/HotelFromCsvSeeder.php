<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Facility;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use App\Models\User;
use App\Models\BedType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class HotelFromCsvSeeder extends Seeder
{
    private $pixabayKey = '58248462-2d21b540c93700d46ff10741e';
    private $exteriorPhotos = [];
    private $roomPhotos = [];

    private function fetchPixabayImages($query)
    {
        try {
            $responses = [];
            $keywords = explode(', ', $query);
            foreach ($keywords as $kw) {
                $response = \Illuminate\Support\Facades\Http::get('https://pixabay.com/api/', [
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
        if (empty($this->exteriorPhotos)) {
            $this->exteriorPhotos = $this->fetchPixabayImages('luxury hotel exterior, modern resort lobby');
        }
        if (empty($this->roomPhotos)) {
            $this->roomPhotos = $this->fetchPixabayImages('hotel room interior, luxury hotel suite');
        }

        $pool = ($type === 'exterior') ? $this->exteriorPhotos : $this->roomPhotos;
        return !empty($pool) ? $pool[array_rand($pool)] : "https://picsum.photos/seed/{$seedId}/1200/800";
    }

    public function run(): void
    {
        // ... (sisanya sama, tapi gunakan $this->getPhotoFromPool saat membuat HotelPhoto dan RoomPhoto)

        $csvFile = database_path('data/hotels.csv');
        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at {$csvFile}");
            return;
        }

        $password = Hash::make('adminhotel');
        $hotelFacilities = Facility::where('category', 'Hotel')->get();
        $roomFacilities = Facility::where('category', 'Room')->get();
        $bathroomFacilities = Facility::where('category', 'Bathroom')->get();

        $roomNames = [
            ['name' => 'Superior Room', 'level' => 'standard'],
            ['name' => 'Deluxe Room', 'level' => 'deluxe'],
            ['name' => 'Executive Suite', 'level' => 'deluxe'],
            ['name' => 'Junior Suite', 'level' => 'luxury'],
        ];

        $fileHandle = fopen($csvFile, 'r');
        // Skip header
        fgetcsv($fileHandle);

        $count = 0;
        while (($row = fgetcsv($fileHandle)) !== false) {
            // [provinsi, kota, nama_hotel, bintang, alamat]
            $provinsi = $row[0] ?? '';
            $cityName = $row[1] ?? '';
            $hotelName = $row[2] ?? '';
            $starRating = (int) ($row[3] ?? 3);
            $address = $row[4] ?? '';

            if (empty($cityName) || empty($hotelName)) {
                continue;
            }

            // Find or create City
            $city = City::firstOrCreate(
                ['city' => $cityName],
                ['province' => $provinsi]
            );

            $slug = Str::slug($hotelName) . '-' . Str::random(5);

            // Create Admin User for this hotel
            $admin = User::create([
                'name' => 'Admin ' . $hotelName,
                'email' => Str::slug($hotelName) . rand(100, 999) . '@gmail.com',
                'password' => $password,
                'role' => 'admin_hotel',
                'status' => 'active',
                'phone' => '08' . rand(1000000000, 9999999999),
            ]);

            // Create Hotel
            $hotel = Hotel::updateOrCreate(
                ['name' => $hotelName, 'city_id' => $city->id],
                [
                    'admin_id' => $admin->id,
                    'slug' => $slug,
                    'description' => "Pengalaman menginap luar biasa di {$hotelName}, destinasi terbaik di {$cityName}.",
                    'address' => $address,
                    'latitude' => -6.2000 + (rand(-15000, 15000) / 1000),
                    'longitude' => 106.8166 + (rand(-15000, 15000) / 1000),
                    'star_rating' => $starRating,
                    'status' => 'active',
                    'policies' => "Kebijakan:\n- Check-in: 14.00 WIB\n- Check-out: 12.00 WIB",
                ]
            );

            // Sync facilities
            if ($hotelFacilities->count() > 0) {
                $hotel->facilities()->sync($hotelFacilities->random(min(4, $hotelFacilities->count()))->pluck('id'));
            }

            // Create BedTypes for this hotel
            $bedTypes = [
                'single' => BedType::firstOrCreate(
                    ['hotel_id' => $hotel->id, 'name' => '1 Single Bed'],
                    ['max_adults' => 1, 'max_children' => 0, 'max_total' => 1, 'status' => 'active']
                ),
                'twin' => BedType::firstOrCreate(
                    ['hotel_id' => $hotel->id, 'name' => '1 Twin Bed'],
                    ['max_adults' => 2, 'max_children' => 0, 'max_total' => 2, 'status' => 'active']
                ),
                'queen' => BedType::firstOrCreate(
                    ['hotel_id' => $hotel->id, 'name' => '1 Queen Bed'],
                    ['max_adults' => 2, 'max_children' => 0, 'max_total' => 2, 'status' => 'active']
                ),
                'king' => BedType::firstOrCreate(
                    ['hotel_id' => $hotel->id, 'name' => '1 King Bed'],
                    ['max_adults' => 2, 'max_children' => 1, 'max_total' => 3, 'status' => 'active']
                ),
            ];

            // Create rooms (3-6 per hotel)
            $selectedRoomNames = collect([
                ['name' => 'Standard Room', 'level' => 'standard', 'bed' => 'single', 'cap' => [1, 0, 1]],
                ['name' => 'Superior Room', 'level' => 'standard', 'bed' => 'twin', 'cap' => [2, 0, 2]],
                ['name' => 'Deluxe Room', 'level' => 'deluxe', 'bed' => 'queen', 'cap' => [2, 0, 2]],
                ['name' => 'Executive Suite', 'level' => 'deluxe', 'bed' => 'king', 'cap' => [2, 1, 3]],
                ['name' => 'Family Room', 'level' => 'luxury', 'bed' => 'king', 'cap' => [3, 2, 5]],
                ['name' => 'Presidential Suite', 'level' => 'luxury', 'bed' => 'super_king', 'cap' => [2, 2, 4]],
            ])->random(rand(3, 6));

            foreach ($selectedRoomNames as $rIndex => $rInfo) {
                $roomName = $rInfo['name'];
                $basePrice = match ($starRating) {
                    5 => rand(1500000, 3000000),
                    4 => rand(800000, 1400000),
                    3 => rand(450000, 750000),
                    default => rand(250000, 400000),
                };
                $price = (int) ($basePrice * (1 + ($rIndex * 0.2)));

                // Resolve Bed Type
                $bedTypeName = match ($rInfo['bed']) {
                    'single' => '1 Single Bed',
                    'twin' => '1 Twin Bed',
                    'queen' => '1 Queen Bed',
                    'king' => '1 King Bed',
                    'super_king' => '1 Super King Bed',
                };
                
                $bedType = BedType::firstOrCreate(
                    ['hotel_id' => $hotel->id, 'name' => $bedTypeName],
                    ['max_adults' => $rInfo['cap'][0], 'max_children' => $rInfo['cap'][1], 'max_total' => $rInfo['cap'][2], 'status' => 'active']
                );

                $roomType = RoomType::create([
                    'hotel_id' => $hotel->id,
                    'bed_type_id' => $bedType->id,
                    'name' => $roomName,
                    'description' => "Kamar {$roomName} yang nyaman di {$hotelName}.",
                    'weekday_price' => $price,
                    'weekend_price' => (int) ($price * 1.2),
                    'stock' => rand(5, 10),
                    'capacity_adult' => $bedType->max_adults,
                    'capacity_child' => $bedType->max_children,
                    'breakfast' => ($starRating >= 3),
                    'smoking_area' => (rand(0, 1) === 1),
                    'is_refundable' => ($starRating >= 4),
                    'is_active' => true,
                    'is_manual_capacity' => false,
                ]);

                // Create 3-4 photos for each room
                for ($p = 0; $p < rand(3, 4); $p++) {
                    RoomPhoto::create([
                        'room_type_id' => $roomType->id,
                        'photo' => $this->getPhotoFromPool('room', $roomType->id . $p),
                        'is_thumbnail' => ($p === 0),
                    ]);
                }
            }

            HotelPhoto::create([
                'hotel_id' => $hotel->id,
                    'photo' => $this->getPhotoFromPool('exterior', $hotel->id),
                'is_thumbnail' => true,
            ]);

            $count++;
        }

        fclose($fileHandle);
        $this->command->info("Successfully seeded {$count} hotels from CSV!");
    }
}
