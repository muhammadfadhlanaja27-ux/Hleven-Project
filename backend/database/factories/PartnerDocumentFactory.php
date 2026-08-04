<?php

namespace Database\Factories;

use App\Models\PartnerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnerDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'partner_application_id' => PartnerApplication::factory(),

            'file' => 'documents/' . fake()->uuid() . '.pdf',

            'document_type' => fake()->randomElement([
                'KTP',
                'NPWP',
                'SIUP',
                'NIB',
            ]),

            'verified' => fake()->boolean(),

            'uploaded_at' => now(),

            'created_at' => now(),
        ];
    }
}