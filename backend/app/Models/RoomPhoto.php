<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomPhoto extends Model
{
    use HasFactory;

    protected $fillable = ['room_type_id', 'photo', 'is_thumbnail'];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}