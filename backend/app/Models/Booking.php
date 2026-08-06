<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code', 'user_id', 'hotel_id', 'check_in', 'check_out',
        'total_night', 'subtotal', 'tax', 'grand_total', 'special_request', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function bookingRooms()
    {
        return $this->hasMany(BookingRoom::class, 'booking_id');
    }

    public function guests()
    {
        return $this->hasMany(Guest::class, 'booking_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'booking_id');
    }

    public function refund()
    {
        return $this->hasOne(Refund::class, 'booking_id');
    }

    public function eTicket()
    {
        return $this->hasOne(ETicket::class, 'booking_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'booking_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(BookingStatusHistory::class, 'booking_id');
    }
}