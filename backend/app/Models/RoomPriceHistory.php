<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomPriceHistory extends Model
{
    use HasFactory;

    protected $fillable = ['room_type_id', 'weekday_price', 'weekend_price', 'effective_from', 'effective_until'];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}