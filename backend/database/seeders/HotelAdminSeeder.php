<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Hotel;
use Illuminate\Support\Facades\Hash;

class HotelAdminSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat User Admin Hotel
        $user = User::create([
            'name' => 'Admin Hotel Baru',
            'email' => 'admin123@hleven.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin_hotel'
        ]);

        // 2. Buat Hotel yang terikat ke User tersebut
        Hotel::create([
            'admin_id' => $user->id,
            'name' => 'Hotel Indah Sejahtera',
            'slug' => 'hotel-indah-sejahtera-' . $user->id,
            'description' => 'Hotel nyaman dan strategis.',
            'address' => 'Jl. Merdeka No. 123, Bandung',
            'city_id' => 1, // Pastikan ID kota 1 ada di tabel cities database Anda
        ]);
    }
}
