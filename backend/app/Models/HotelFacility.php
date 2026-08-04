<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class HotelFacility extends Pivot
{
    protected $table = 'hotel_facilities';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'facility_id',
    ];
}