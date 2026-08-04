<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomPriceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_type_id',
        'weekday_price',
        'weekend_price',
        'effective_from',
        'effective_until',
    ];

    protected function casts(): array
    {
        return [
            'weekday_price' => 'decimal:2',
            'weekend_price' => 'decimal:2',
            'effective_from' => 'datetime',
            'effective_until' => 'datetime',
        ];
    }

    /**
     * Tipe kamar.
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}