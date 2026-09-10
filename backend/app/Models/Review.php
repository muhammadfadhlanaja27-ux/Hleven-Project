<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'hotel_id', 'user_id', 'rating', 'comment', 'reply', 'reply_at'];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}