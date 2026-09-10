<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin
        User::updateOrCreate(
            ['email' => 'superadmin@hleven.com'],
            [
                'name' => 'Super Admin H\'Leven',
                'role' => 'super_admin',
                'password' => Hash::make('password123'),
                'phone' => '081111111111',
                'status' => 'active',
            ]
        );

        // 2. Admin Hotel
        User::updateOrCreate(
            ['email' => 'adminhotel@hleven.com'],
            [
                'name' => 'Hotel Manager Partner',
                'role' => 'admin_hotel',
                'password' => Hash::make('password123'),
                'phone' => '082222222222',
                'status' => 'active',
            ]
        );

        // 3. Regular User
        User::updateOrCreate(
            ['email' => 'user@hleven.com'],
            [
                'name' => 'John Doe (Customer)',
                'role' => 'user',
                'password' => Hash::make('password123'),
                'phone' => '083333333333',
                'status' => 'active',
            ]
        );
    }
}