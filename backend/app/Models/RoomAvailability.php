<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomAvailability extends Model
{
    use HasFactory;

    protected $fillable = ['room_type_id', 'date', 'available_stock', 'booked_room', 'price', 'is_closed'];

    protected $casts = [
        'price' => 'decimal:2',
        'is_closed' => 'boolean',
    ];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}
