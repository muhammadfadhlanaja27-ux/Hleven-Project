<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomTypeCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $attributes = [
        'status' => 'active',
    ];

    protected $fillable = [
        'hotel_id',
        'name',
        'description',
        'status',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class, 'room_type_category_id');
    }
}
