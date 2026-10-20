<?php

namespace Database\Seeders;

use App\Models\BedType;
use App\Models\Hotel;
use Illuminate\Database\Seeder;

class BedTypeSeeder extends Seeder
{
    public function run(): void
    {
        $defaultBedTypes = [
            '1 Single Bed',
            '1 Twin Bed',
            '1 Queen Bed',
            '1 King Bed',
        ];

        Hotel::query()->each(function (Hotel $hotel) use ($defaultBedTypes): void {
            foreach ($defaultBedTypes as $name) {
                $bedType = BedType::withTrashed()->firstOrNew([
                    'hotel_id' => $hotel->id,
                    'name' => $name,
                ]);

                if ($bedType->trashed()) {
                    $bedType->restore();
                } elseif (! $bedType->exists) {
                    $bedType->status = 'active';
                    $bedType->save();
                }
            }
        });
    }
}
