<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            // Hotel Facilities
            ['name' => 'Kolam Renang', 'category' => 'Hotel'],
            ['name' => 'Wi-Fi Gratis', 'category' => 'Hotel'],
            ['name' => 'Parkir Gratis', 'category' => 'Hotel'],
            ['name' => 'Resepsionis 24 Jam', 'category' => 'Hotel'],
            ['name' => 'Pusat Kebugaran', 'category' => 'Hotel'],
            
            // Room Facilities
            ['name' => 'AC', 'category' => 'Room'],
            ['name' => 'TV LED 43 inch', 'category' => 'Room'],
            ['name' => 'Brankas Kamar', 'category' => 'Room'],
            ['name' => 'Pembuat Teh/Kopi', 'category' => 'Room'],
            
            // Bathroom Facilities
            ['name' => 'Water Heater', 'category' => 'Bathroom'],
            ['name' => 'Shower', 'category' => 'Bathroom'],
            ['name' => 'Bathtub', 'category' => 'Bathroom'],
            ['name' => 'Peralatan Mandi Gratis', 'category' => 'Bathroom'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate(['name' => $facility['name']], $facility);
        }
    }
}