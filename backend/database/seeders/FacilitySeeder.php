<?php

namespace Database\Seeders;

use App\Enums\FacilityCategory;
use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [

            [
                'name' => 'WiFi',
                'category' => FacilityCategory::HOTEL,
            ],

            [
                'name' => 'Swimming Pool',
                'category' => FacilityCategory::HOTEL,
            ],

            [
                'name' => 'Restaurant',
                'category' => FacilityCategory::HOTEL,
            ],

            [
                'name' => 'Parking Area',
                'category' => FacilityCategory::HOTEL,
            ],

            [
                'name' => 'Air Conditioner',
                'category' => FacilityCategory::ROOM,
            ],

            [
                'name' => 'Television',
                'category' => FacilityCategory::ROOM,
            ],

            [
                'name' => 'Mini Bar',
                'category' => FacilityCategory::ROOM,
            ],

            [
                'name' => 'Hot Shower',
                'category' => FacilityCategory::BATHROOM,
            ],

            [
                'name' => 'Hair Dryer',
                'category' => FacilityCategory::BATHROOM,
            ],

        ];

        foreach ($facilities as $facility) {
            Facility::create($facility);
        }
    }
}