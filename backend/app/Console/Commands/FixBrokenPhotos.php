<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;

class FixBrokenPhotos extends Command
{
    protected $signature = 'photos:fix-to-flickr';
    protected $description = 'Fix broken Pixabay/Localhost URLs to Lorem Flickr and Picsum with high variety';

    public function handle()
    {
        // 25+ URL Unsplash Terkurasi & Permanen
        $star5 = ['1542314831-068cd1dbfeeb', '1566073771259-6a8506099945', '1571896349842-33c89424de2d', '1544550588-039c27702e1b'];
        $star4 = ['1551882547-aff4cfc081e0', '1520250497591-112f2f40a3f4', '1564501049412-61c2a3083791', '1582719478250-c89cae4dc85b'];
        $star3 = ['1590490360182-c33d57733427', '1611892440504-42a792e24d32', '1591088398332-8a7b03a69845'];
        $star12 = ['1582719508491-dd8cc26283b7', '1631049307264-da0ec9a703b4', '1566665797739-1674de7a421a'];

        $getUnsplash = function($star) use ($star5, $star4, $star3, $star12) {
            $pool = match((int)$star) {
                5 => $star5,
                4 => $star4,
                3 => $star3,
                default => $star12
            };
            $id = $pool[array_rand($pool)];
            return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w=1200&q=80";
        };

        $this->info('Fixing photos with static premium Unsplash pool...');

        // Update Hotels
        \App\Models\Hotel::with('photos')->chunk(100, function ($hotels) use ($getUnsplash) {
            foreach ($hotels as $hotel) {
                // Spesifik untuk Padma & Budi
                if ($hotel->id == 1793) {
                    $hotel->photos()->update(['photo' => '/images/hotel-lokal/budi-house.jpg']);
                } elseif ($hotel->id == 1794) {
                    $hotel->photos()->update(['photo' => '/images/hotel-lokal/padma-hotel.jpg']);
                } else {
                    foreach ($hotel->photos as $photo) {
                        $photo->update(['photo' => $getUnsplash($hotel->star_rating)]);
                    }
                }
            }
            $this->output->write('.');
        });

        // Update Rooms
        \App\Models\RoomPhoto::chunk(500, function ($photos) use ($getUnsplash) {
            foreach ($photos as $photo) {
                $photo->update(['photo' => $getUnsplash(3)]); // Kamar pakai pool standar
            }
            $this->output->write('.');
        });

        $this->info("\nDone!");
    }
}
