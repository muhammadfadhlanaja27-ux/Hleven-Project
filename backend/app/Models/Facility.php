<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facility extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['hotel_id', 'name', 'category', 'icon', 'description', 'status'];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function hotels()
    {
        return $this->belongsToMany(Hotel::class, 'hotel_facilities', 'facility_id', 'hotel_id');
    }

    public function roomTypes()
    {
        return $this->belongsToMany(RoomType::class, 'room_facilities', 'facility_id', 'room_type_id');
    }
}