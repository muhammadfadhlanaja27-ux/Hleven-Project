<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingRoom extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['booking_id', 'room_type_id', 'qty', 'price_per_night', 'subtotal'];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}