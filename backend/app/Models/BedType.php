<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BedType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'hotel_id',
        'name',
        'size',
        'max_adults',
        'max_children',
        'max_total',
        'description',
        'status',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class, 'bed_type_id');
    }
}
