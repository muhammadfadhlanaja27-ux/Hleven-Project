<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'hotel_id', 'name', 'type', 'bed', 'description', 'weekday_price', 'weekend_price',
        'stock', 'capacity_adult', 'capacity_child', 'breakfast', 'smoking_area', 'is_refundable'
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function photos()
    {
        return $this->hasMany(RoomPhoto::class, 'room_type_id');
    }

    public function facilities()
    {
        return $this->belongsToMany(Facility::class, 'room_facilities', 'room_type_id', 'facility_id');
    }

    public function availabilities()
    {
        return $this->hasMany(RoomAvailability::class, 'room_type_id');
    }

    public function priceHistories()
    {
        return $this->hasMany(RoomPriceHistory::class, 'room_type_id');
    }

    public function bookingRooms()
    {
        return $this->hasMany(BookingRoom::class, 'room_type_id');
    }
}