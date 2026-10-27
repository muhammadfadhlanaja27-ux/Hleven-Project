<?php

namespace Database\Seeders;

use App\Models\PartnerApplication;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class PartnerApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $statuses = ['pending', 'approved', 'rejected'];

        for ($i = 0; $i < 20; $i++) {
            $user = \App\Models\User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'active',
            ]);
            
            PartnerApplication::create([
                'user_id' => $user->id,
                'owner_name' => $faker->name,
                'owner_email' => $faker->safeEmail,
                'owner_phone' => $faker->phoneNumber,
                'owner_id_number' => $faker->nik(),
                'hotel_name' => $faker->company . ' Hotel',
                'hotel_description' => $faker->paragraph,
                'hotel_phone' => $faker->phoneNumber,
                'hotel_email' => $faker->companyEmail,
                'address' => $faker->address,
                'city' => $faker->city,
                'requested_star_rating' => rand(1, 5),
                'status' => $statuses[array_rand($statuses)],
            ]);
        }
    }
}
