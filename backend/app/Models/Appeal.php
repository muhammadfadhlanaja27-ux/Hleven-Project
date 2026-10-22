<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appeal extends Model
{
    protected $fillable = ['hotel_id', 'warning_id', 'admin_hotel_id', 'reason', 'status', 'admin_note', 'decided_by', 'decided_at'];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function warning()
    {
        return $this->belongsTo(Warning::class, 'warning_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'admin_hotel_id');
    }

    public function decider()
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
