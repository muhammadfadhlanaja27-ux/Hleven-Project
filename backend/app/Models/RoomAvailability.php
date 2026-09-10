<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomAvailability extends Model
{
    use HasFactory;

    protected $fillable = ['room_type_id', 'date', 'available_stock', 'booked_room'];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}