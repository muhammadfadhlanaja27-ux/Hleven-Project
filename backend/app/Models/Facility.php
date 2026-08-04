<?php

namespace App\Models;

use App\Enums\FacilityCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
    ];

    protected function casts(): array
    {
        return [
            'category' => FacilityCategory::class,
        ];
    }

    /**
     * Hotel yang memiliki fasilitas ini.
     */
    public function hotels(): BelongsToMany
    {
        return $this->belongsToMany(
            Hotel::class,
            'hotel_facilities'
        );
    }

    /**
     * Room yang memiliki fasilitas ini.
     */
    public function roomTypes(): BelongsToMany
    {
        return $this->belongsToMany(
            RoomType::class,
            'room_facilities'
        );
    }
}