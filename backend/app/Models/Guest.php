<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['booking_id', 'name', 'phone', 'gender', 'identity_number'];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}