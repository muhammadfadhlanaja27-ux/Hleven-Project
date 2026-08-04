<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoomFacility extends Pivot
{
    protected $table = 'room_facilities';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'room_type_id',
        'facility_id',
    ];
}