<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'name',
        'description',
        'weekday_price',
        'weekend_price',
        'stock',
        'capacity_adult',
        'capacity_child',
        'breakfast',
        'smoking_area',
    ];

    protected function casts(): array
    {
        return [
            'weekday_price' => 'decimal:2',
            'weekend_price' => 'decimal:2',
            'breakfast' => 'boolean',
            'smoking_area' => 'boolean',
        ];
    }

    /**
     * Hotel pemilik tipe kamar.
     */
    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    /**
     * Foto kamar.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(RoomPhoto::class);
    }

    /**
     * Fasilitas kamar.
     */
    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(
            Facility::class,
            'room_facilities'
        );
    }

    /**
     * Ketersediaan kamar.
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(RoomAvailability::class);
    }

    /**
     * Riwayat harga kamar.
     */
    public function priceHistories(): HasMany
    {
        return $this->hasMany(RoomPriceHistory::class);
    }

    /**
     * Detail booking.
     */
    public function bookingRooms(): HasMany
    {
        return $this->hasMany(BookingRoom::class);
    }
}