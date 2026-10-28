<?php

namespace Database\Seeders;

use App\Models\BedType;
use App\Models\City;
use App\Models\Facility;
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

class MasterDataGeneratorSeeder extends Seeder
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
        } catch (\Exception $e) {
            return ["https://picsum.photos/800/600"];
        }
    }

    public function run(): void
    {
        // Pastikan Master Fasilitas ada
        if (Facility::count() === 0) {
            $this->call(FacilitySeeder::class);
        }

        $filePath = database_path('data/hotels.csv');
        if (!file_exists($filePath)) {
            echo "File hotels.csv tidak ditemukan!\n";
            return;
        }

        $csv = array_map('str_getcsv', file($filePath));
        array_shift($csv); // skip header

        // Pustaka Ulasan Gen-Z (Positif, Netral, Negatif)
        $reviewsPool = [
            ["rating" => 5, "comment" => "Jujurly ini hotel gokil bgt, viewnya gak ada obat! Slay parah pelayanannya."],
            ["rating" => 5, "comment" => "Best staycation ever! Estetik bgt tempatnya, cocok buat feeds Instagram. Worth to buy!"],
            ["rating" => 5, "comment" => "Gila sih ini nyaman bgt, kasurnya empuk kayak di awan. Bakal balik lagi fix."],
            ["rating" => 4, "comment" => "Lokasi strategis, mau kemana-mana gampang. Mas-mas resepsionisnya juga ramah pol."],
            ["rating" => 4, "comment" => "Fasilitas oke punya, kolam renangnya bersih. Kurang dikit di parkiran aja agak sempit."],
            ["rating" => 3, "comment" => "B aja sih, standar hotel pada umumnya. Buat kaum mendang-mending masih oke lah."],
            ["rating" => 3, "comment" => "Lumayan buat numpang tidur semalam. AC-nya agak lama dinginnya tapi ya udahlah ya."],
            ["rating" => 3, "comment" => "Breakfast-nya biasa aja rasanya, tapi suasananya enak tenang."],
            ["rating" => 2, "comment" => "Agak laen emang, kamarnya mid bgt gak sesuai foto. Agak kecewa sih."],
            ["rating" => 1, "comment" => "Kebersihannya minus parah, gws deh. Kapok gak mau ke sini lagi."]
        ];

        $roomConfigs = [
            'Standard' => ['adult' => 1, 'child' => 0, 'bed_name' => 'Single Bed', 'bed_size' => '90cm x 200cm', 'base_price' => 350000],
            'Superior' => ['adult' => 2, 'child' => 1, 'bed_name' => 'Twin Bed', 'bed_size' => '2x (90cm x 200cm)', 'base_price' => 700000],
            'Deluxe' => ['adult' => 2, 'child' => 1, 'bed_name' => 'Queen Bed', 'bed_size' => '160cm x 200cm', 'base_price' => 1100000],
            'Junior Suite' => ['adult' => 2, 'child' => 2, 'bed_name' => 'King Bed', 'bed_size' => '180cm x 200cm', 'base_price' => 1800000],
            'Suite' => ['adult' => 2, 'child' => 2, 'bed_name' => 'Super King Bed', 'bed_size' => '200cm x 200cm', 'base_price' => 2800000],
            'Presidential Suite' => ['adult' => 2, 'child' => 2, 'bed_name' => 'Super King Bed', 'bed_size' => '200cm x 200cm', 'base_price' => 5000000],
        ];

        $starMultipliers = [1 => 0.8, 2 => 1.0, 3 => 1.4, 4 => 2.0, 5 => 3.0];

        echo "Mengambil sampel foto dari Pixabay...\n";
        $hotelPhotoPool = $this->fetchImages('luxury hotel exterior lobby resort', 30);
        $roomPhotoPool = $this->fetchImages('hotel room interior bed luxury bathroom', 30);

        $dummyUsers = [];
        for ($u = 1; $u <= 20; $u++) {
            $dummyUsers[] = User::create([
                'name' => "User GenZ " . $u,
                'email' => "genz{$u}" . rand(100,999) . "@hleven.com",
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active'
            ]);
        }

        $allHotelFacs = Facility::where('category', 'Hotel')->get();
        $allRoomFacs = Facility::whereIn('category', ['Room', 'Bathroom'])->get();

        $count = 0;
        foreach ($csv as $row) {
            if (count($row) < 3) continue;

            DB::transaction(function () use ($row, $roomConfigs, $starMultipliers, $hotelPhotoPool, $roomPhotoPool, $reviewsPool, $dummyUsers, $allHotelFacs, $allRoomFacs) {
                $cityName = $row[0];
                $hotelName = $row[1];
                $star = (int)$row[2];
                $address = $row[3] ?? 'Alamat strategis pusat kota';

                $city = City::firstOrCreate(['city' => $cityName], ['province' => 'Indonesia']);

                $adminUser = User::create([
                    'name' => $hotelName,
                    'email' => Str::slug($hotelName) . rand(1000, 9999) . '@hleven.com',
                    'password' => Hash::make('adminhotel'),
                    'role' => 'admin_hotel',
                    'status' => 'active'
                ]);

                $hotel = Hotel::create([
                    'admin_id' => $adminUser->id,
                    'city_id' => $city->id,
                    'name' => $hotelName,
                    'slug' => Str::slug($hotelName) . '-' . Str::random(5),
                    'address' => $address,
                    'star_rating' => $star,
                    'description' => "Pengalaman menginap berkelas di {$hotelName}. Nikmati fasilitas modern dan pelayanan terbaik untuk liburan maupun perjalanan bisnis Anda.",
                    'policies' => "Check-in pukul 14.00 WIB, Check-out pukul 12.00 WIB. Dilarang merokok di dalam kamar.",
                    'status' => 'active'
                ]);

                // Fasilitas Hotel (Berdasarkan Bintang)
                $numHotelFacs = ($star >= 4) ? rand(15, 25) : (($star == 3) ? rand(8, 12) : rand(4, 7));
                $hotel->facilities()->sync($allHotelFacs->random(min($numHotelFacs, $allHotelFacs->count()))->pluck('id'));

                // Foto Hotel
                for ($h = 0; $h < rand(4, 6); $h++) {
                    HotelPhoto::create([
                        'hotel_id' => $hotel->id,
                        'photo' => $hotelPhotoPool[array_rand($hotelPhotoPool)],
                        'is_thumbnail' => ($h === 0)
                    ]);
                }

                // Ulasan Gen-Z
                for ($r = 0; $r < rand(1, 10); $r++) {
                    $rev = $reviewsPool[array_rand($reviewsPool)];
                    Review::create([
                        'hotel_id' => $hotel->id,
                        'user_id' => $dummyUsers[array_rand($dummyUsers)]->id,
                        'rating' => $rev['rating'],
                        'comment' => $rev['comment']
                    ]);
                }

                // Kamar
                $keys = array_keys($roomConfigs);
                shuffle($keys);
                $selectedTypes = array_slice($keys, 0, rand(3, 8));

                foreach ($selectedTypes as $typeName) {
                    $cfg = $roomConfigs[$typeName];
                    
                    $bedType = BedType::create([
                        'hotel_id' => $hotel->id,
                        'name' => $cfg['bed_name'],
                        'size' => $cfg['bed_size'],
                        'max_adults' => $cfg['adult'],
                        'max_children' => $cfg['child'],
                        'max_total' => $cfg['adult'] + $cfg['child'],
                        'description' => "Kasur tipe {$cfg['bed_name']} ukuran {$cfg['bed_size']}.",
                        'status' => 'active'
                    ]);

                    $multiplier = $starMultipliers[$star] ?? 1.0;
                    $weekdayPrice = (int)(rand($cfg['base_price'], $cfg['base_price'] + 400000) * $multiplier * (rand(950, 1050) / 1000));
                    $isRefundable = $weekdayPrice <= 2000000;

                    $room = RoomType::create([
                        'hotel_id' => $hotel->id,
                        'bed_type_id' => $bedType->id,
                        'name' => "{$typeName} ({$cfg['bed_name']})",
                        'type' => $typeName,
                        'bed' => $cfg['bed_name'],
                        'description' => "Kamar {$typeName} eksklusif dengan kasur {$cfg['bed_name']}.",
                        'weekday_price' => $weekdayPrice,
                        'weekend_price' => (int)($weekdayPrice * 1.2),
                        'stock' => rand(3, 10),
                        'capacity_adult' => $cfg['adult'],
                        'capacity_child' => $cfg['child'],
                        'breakfast' => ($star >= 3),
                        'is_refundable' => $isRefundable,
                        'policies' => $isRefundable ? "Refundable." : "Non-refundable (>2jt).",
                        'is_active' => true
                    ]);

                    // Fasilitas Kamar (Berdasarkan Tipe)
                    $numRoomFacs = in_array($typeName, ['Presidential Suite', 'Suite']) ? rand(15, 20) : (in_array($typeName, ['Deluxe', 'Junior Suite']) ? rand(10, 14) : rand(4, 8));
                    $room->facilities()->sync($allRoomFacs->random(min($numRoomFacs, $allRoomFacs->count()))->pluck('id'));

                    for ($p = 0; $p < rand(4, 7); $p++) {
                        RoomPhoto::create([
                            'room_type_id' => $room->id,
                            'photo' => $roomPhotoPool[array_rand($roomPhotoPool)],
                            'is_thumbnail' => ($p === 0)
                        ]);
                    }
                }
            });

            $count++;
            if ($count % 50 == 0) echo "Progress: {$count} hotel...\n";
        }
        echo "Selesai! Total: {$count}\n";
    }
}
