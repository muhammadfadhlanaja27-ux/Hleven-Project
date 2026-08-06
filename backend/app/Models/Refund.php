<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'requested_by',
        'approved_by',
        'reason',
        'status',
        'requested_at',
        'approved_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Relasi ke Booking
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    // Relasi ke User yang mengajukan refund
    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    // Relasi ke User (Admin) yang menyetujui refund
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}