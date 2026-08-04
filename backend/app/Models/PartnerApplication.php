<?php

namespace App\Models;

use App\Enums\PartnerStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerApplication extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'owner_name',
        'hotel_name',
        'email',
        'phone',
        'status',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PartnerStatus::class,
            'created_at' => 'datetime',
        ];
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PartnerDocument::class);
    }
}