<?php

namespace App\Models;

use App\Enums\GenderType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guest extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'name',
        'phone',
        'gender',
        'identity_number',
    ];

    protected function casts(): array
    {
        return [
            'gender' => GenderType::class,
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}