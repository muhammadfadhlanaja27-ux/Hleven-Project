<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hotel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'admin_id', 'city_id', 'name', 'slug', 'description', 'address',
        'average_rating', 'total_review', 'latitude', 'longitude', 'status'
    ];

    protected $appends = ['starting_price', 'thumbnail'];

    public function getStartingPriceAttribute()
    {
        if ($this->relationLoaded('roomTypes')) {
            return $this->roomTypes->min('weekday_price') ?? 0;
        }
        return $this->roomTypes()->min('weekday_price') ?? 0;
    }

    public function getThumbnailAttribute()
    {
        if ($this->relationLoaded('photos')) {
            $thumbnailPhoto = $this->photos->firstWhere('is_thumbnail', true) ?? $this->photos->first();
            return $thumbnailPhoto ? $thumbnailPhoto->photo : null;
        }
        $thumbnailPhoto = $this->photos()->where('is_thumbnail', true)->first() ?? $this->photos()->first();
        return $thumbnailPhoto ? $thumbnailPhoto->photo : null;
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function photos()
    {
        return $this->hasMany(HotelPhoto::class, 'hotel_id');
    }

    public function facilities()
    {
        return $this->belongsToMany(Facility::class, 'hotel_facilities', 'hotel_id', 'facility_id');
    }

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class, 'hotel_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'hotel_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'hotel_id');
    }
}