<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Hotel;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        
        $goodComments = [
            "Mantap banget! Kamarnya bersih parah.",
            "Lokasinya juara, dekat ke mana-mana.",
            "Stafnya ramah banget, enak diajak ngobrol.",
            "Fasilitas oke lah, sesuai harga.",
            "Kolam renangnya asik buat santai sore.",
            "Worth it parah sih ini, besok-besok ke sini lagi.",
            "Pelayanannya gercep, suka banget.",
            "Tempatnya nyaman, cocok buat healing.",
            "Recommended buat yang bawa keluarga.",
            "View-nya bagus, kamar juga luas."
        ];

        $badComments = [
            "Jorok banget kamarnya, banyak debu.",
            "AC panas, gak dingin sama sekali, kecewa.",
            "Staf resepsionis judes, males banget.",
            "Fasilitas tua dan gak terawat, rugi.",
            "Berisik banget, gak bisa tidur.",
            "Lokasi susah dicari, parkiran sempit.",
            "Sarapan gak enak dan pilihannya dikit.",
            "Toilet kotor, bau lagi.",
            "Internet lemot, gak bisa kerja.",
            "Gak sesuai ekspektasi, jangan tertipu foto."
        ];

        // Ambil 400 hotel acak
        $hotels = Hotel::inRandomOrder()->limit(400)->get();

        foreach ($hotels as $index => $hotel) {
            $roomTypes = $hotel->roomTypes;
            if ($roomTypes->isEmpty()) continue;

            $reviewCount = rand(5, 8);
            $reviewsData = [];

            for ($i = 0; $i < $reviewCount; $i++) {
                $guest = User::create([
                    'name' => $faker->name,
                    'email' => $faker->unique()->safeEmail,
                    'password' => bcrypt('password'),
                    'role' => 'user',
                ]);

                // 20% hotel akan memiliki ulasan dominan buruk
                $isBadHotel = ($index < 80);
                $rating = $isBadHotel ? rand(1, 2) : rand(3, 5);
                $comment = ($rating <= 2) ? $badComments[array_rand($badComments)] : $goodComments[array_rand($goodComments)];

                $room = $roomTypes->random();
                $booking = Booking::create([
                    'booking_code' => 'BOOK-' . Str::upper(Str::random(8)),
                    'user_id' => $guest->id,
                    'hotel_id' => $hotel->id,
                    'check_in' => Carbon::now()->subDays(rand(5, 60)),
                    'check_out' => Carbon::now()->subDays(rand(1, 4)),
                    'total_night' => 2,
                    'subtotal' => $room->weekday_price * 2,
                    'tax' => ($room->weekday_price * 2) * 0.1,
                    'grand_total' => ($room->weekday_price * 2) * 1.1,
                    'status' => 'checked_out',
                ]);

                BookingRoom::create([
                    'booking_id' => $booking->id,
                    'room_type_id' => $room->id,
                    'qty' => 1,
                    'price_per_night' => $room->weekday_price,
                    'subtotal' => $room->weekday_price * 2,
                ]);

                $reviewsData[] = [
                    'booking_id' => $booking->id,
                    'hotel_id' => $hotel->id,
                    'user_id' => $guest->id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Bulk insert review
            Review::insert($reviewsData);

            $hotel->update([
                'average_rating' => round(Review::where('hotel_id', $hotel->id)->avg('rating') ?? 5.0, 1),
                'total_review' => Review::where('hotel_id', $hotel->id)->count(),
            ]);
        }
    }
}
