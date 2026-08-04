<?php

namespace Database\Factories;

use App\Enums\FacilityCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class FacilityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'category' => fake()->randomElement(FacilityCategory::cases()),
        ];
    }
}