<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['province' => 'DKI Jakarta', 'city' => 'Jakarta Pusat'],
            ['province' => 'Jawa Barat', 'city' => 'Bandung'],
            ['province' => 'DI Yogyakarta', 'city' => 'Yogyakarta'],
            ['province' => 'Bali', 'city' => 'Denpasar'],
            ['province' => 'Jawa Timur', 'city' => 'Surabaya'],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}
