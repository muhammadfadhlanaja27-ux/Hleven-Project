<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'province',
        'city',
    ];

    protected function casts(): array
    {
        return [];
    }

    /**
     * Hotel yang berada di kota ini.
     */
    public function hotels(): HasMany
    {
        return $this->hasMany(Hotel::class);
    }
}