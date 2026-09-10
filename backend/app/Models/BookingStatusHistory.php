<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingStatusHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['booking_id', 'old_status', 'new_status', 'changed_by', 'changed_at'];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}