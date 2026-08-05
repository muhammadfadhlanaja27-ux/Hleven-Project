<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([

            RoleSeeder::class,

            PermissionSeeder::class,

            CitySeeder::class,

            UserSeeder::class,

            FacilitySeeder::class,

            HotelSeeder::class,

            RoomSeeder::class,

            BookingSeeder::class,

        ]);
    }
}