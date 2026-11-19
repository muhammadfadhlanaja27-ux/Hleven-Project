<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CitySeeder::class,
            FacilitySeeder::class,
            UserSeeder::class,
            HotelFromCsvSeeder::class,
            ReviewSeeder::class,
            BedTypeSeeder::class,
        ]);
    }
}
