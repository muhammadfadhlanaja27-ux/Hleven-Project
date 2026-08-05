<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'role' => UserRole::SUPER_ADMIN,
            'name' => 'Super Admin',
            'email' => 'superadmin@hleven.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::ACTIVE,
        ]);

        User::create([
            'role' => UserRole::ADMIN_HOTEL,
            'name' => 'Hotel Admin',
            'email' => 'admin@hleven.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::ACTIVE,
        ]);

        User::create([
            'role' => UserRole::USER,
            'name' => 'Customer',
            'email' => 'user@hleven.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::ACTIVE,
        ]);

        User::factory(20)->create();
    }
}