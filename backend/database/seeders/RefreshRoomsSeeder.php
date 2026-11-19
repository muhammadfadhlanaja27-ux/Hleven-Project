<?php

namespace Database\Seeders;

use App\Models\BedType;
use App\Models\Facility;
use App\Models\Hotel;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class RefreshRoomsSeeder extends Seeder
{
    private $pixabayKey = '58248462-2d21b540c93700d46ff10741e';
    private $roomPhotos = [];

    private function fetchPixabayImages($query)
    {
        try {
            $response = Http::get('https://pixabay.com/api/', [
                'key' => $this->pixabayKey,
                'q' => $query,
                'image_type' => 'photo',
                'orientation' => 'horizontal',
                'per_page' => 100,
            ]);
            return $response->successful() ? collect($response->json()['hits'])->pluck('largeImageURL')->toArray() : [];
        } catch (\Exception $e) { return []; }
    }

    public function run(): void
    {
        // 1. Hapus data kamar lama dengan aman tanpa truncate constraint error
        Schema::disableForeignKeyConstraints();
        RoomPhoto::truncate();
        RoomType::truncate();
        BedType::truncate();
        Schema::enableForeignKeyConstraints();

        $roomFacilities = Facility::where('category', 'Room')->get();
        $bathroomFacilities = Facility::where('category', 'Bathroom')->get();
        $this->roomPhotos = $this->fetchPixabayImages('hotel room interior, luxury hotel suite');

        $roomOptions = [
            'Standard' => ['level' => 'standard', 'beds' => [['single', 1, 0, 1], ['twin', 2, 0, 2]]],
            'Superior' => ['level' => 'standard', 'beds' => [['single', 1, 0, 1], ['twin', 2, 0, 2], ['queen', 2, 0, 2]]],
            'Deluxe'   => ['level' => 'deluxe', 'beds' => [['queen', 2, 0, 2], ['king', 2, 1, 3]]],
            'Executive Suite' => ['level' => 'deluxe', 'beds' => [['king', 2, 1, 3], ['queen', 2, 0, 2]]],
            'Family Room' => ['level' => 'luxury', 'beds' => [['king', 2, 2, 4], ['super_king', 2, 2, 4]]],
            'Presidential Suite' => ['level' => 'luxury', 'beds' => [['super_king', 2, 2, 4]]],
        ];

        $bedLabels = [
            'single' => '1 Single Bed',
            'twin' => '1 Twin Bed',
            'queen' => '1 Queen Bed',
            'king' => '1 King Bed',
            'super_king' => '1 Super King Bed',
        ];

        Hotel::all()->each(function ($hotel) use ($roomOptions, $bedLabels, $roomFacilities, $bathroomFacilities) {
            $star = $hotel->star_rating;
            $limit = ($star >= 4) ? 6 : 3;
            $selectedRooms = collect($roomOptions);
            $shuffledKeys = $selectedRooms->keys()->shuffle()->take(rand(3, $limit));

            foreach ($shuffledKeys as $name) {
                $cfg = $roomOptions[$name];
                $bedData = $cfg['beds'][array_rand($cfg['beds'])];
                $bedType = BedType::firstOrCreate(
                    ['hotel_id' => $hotel->id, 'name' => $bedLabels[$bedData[0]]],
                    ['max_adults' => $bedData[1], 'max_children' => $bedData[2], 'max_total' => $bedData[3], 'status' => 'active']
                );

                $price = rand(300000, 2000000);
                $roomType = RoomType::create([
                    'hotel_id' => $hotel->id,
                    'bed_type_id' => $bedType->id,
                    'name' => $name,
                    'description' => "Kamar {$name} yang nyaman di {$hotel->name}.",
                    'weekday_price' => $price,
                    'weekend_price' => (int)($price * 1.2),
                    'stock' => rand(3, 8),
                    'capacity_adult' => $bedType->max_adults,
                    'capacity_child' => $bedType->max_children,
                    'breakfast' => ($star >= 3),
                    'is_active' => true,
                ]);

                $roomType->facilities()->sync($roomFacilities->random(rand(2, 5))->pluck('id'));
                
                for ($i = 0; $i < rand(3, 4); $i++) {
                    RoomPhoto::create([
                        'room_type_id' => $roomType->id,
                        'photo' => !empty($this->roomPhotos) ? $this->roomPhotos[array_rand($this->roomPhotos)] : "https://picsum.photos/800/600",
                        'is_thumbnail' => ($i === 0),
                    ]);
                }
            }
        });
    }
}
