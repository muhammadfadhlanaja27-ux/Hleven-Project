<?php

namespace App\Models;

use App\Enums\HotelStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'city_id',
        'name',
        'slug',
        'description',
        'address',
        'average_rating',
        'total_review',
        'latitude',
        'longitude',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'average_rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'status' => HotelStatus::class,
        ];
    }

    /**
     * Admin hotel.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Kota hotel.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Foto hotel.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(HotelPhoto::class);
    }

    /**
     * Tipe kamar.
     */
    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }

    /**
     * Booking hotel.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Review hotel.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Warning hotel.
     */
    public function warnings(): HasMany
    {
        return $this->hasMany(Warning::class);
    }

    /**
     * Fasilitas hotel.
     */
    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(
            Facility::class,
            'hotel_facilities'
        );
    }
}