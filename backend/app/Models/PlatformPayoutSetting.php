<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformPayoutSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'payout_day',
        'is_active',
        'target_email',
    ];

    protected $casts = [
        'payout_day' => 'integer',
        'is_active' => 'boolean',
    ];
}
