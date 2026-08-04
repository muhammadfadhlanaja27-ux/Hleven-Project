<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [

            [
                'province' => 'Jawa Barat',
                'city' => 'Bandung',
            ],

            [
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta',
            ],

            [
                'province' => 'Jawa Tengah',
                'city' => 'Semarang',
            ],

            [
                'province' => 'DI Yogyakarta',
                'city' => 'Yogyakarta',
            ],

            [
                'province' => 'Jawa Timur',
                'city' => 'Surabaya',
            ],

            [
                'province' => 'Bali',
                'city' => 'Denpasar',
            ],

            [
                'province' => 'Sumatera Utara',
                'city' => 'Medan',
            ],

            [
                'province' => 'Sulawesi Selatan',
                'city' => 'Makassar',
            ],

        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}