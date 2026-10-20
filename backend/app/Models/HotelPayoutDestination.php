<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HotelPayoutDestination extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'hotel_id',
        'type',
        'channel_code',
        'account_number',
        'account_name',
        'provider_recipient_id',
        'status',
    ];

    protected $hidden = [
        'account_number',
        'provider_recipient_id',
    ];

    protected $casts = [
        'account_number' => 'encrypted',
    ];

    protected $appends = ['masked_account_number'];

    public function getMaskedAccountNumberAttribute(): string
    {
        $accountNumber = $this->account_number;

        return str_repeat('*', max(strlen($accountNumber) - 4, 0)).substr($accountNumber, -4);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(HotelWithdrawal::class, 'destination_id');
    }
}
