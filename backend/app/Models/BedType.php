<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BedType extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id', 'name', 'size', 'max_adults', 'max_children', 'max_total', 'description',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class, 'bed_type_id');
    }
}
