<?php

namespace App\Models;

use App\Enums\WarningStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Warning extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'super_admin_id',
        'title',
        'message',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => WarningStatus::class,
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function superAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'super_admin_id');
    }
}