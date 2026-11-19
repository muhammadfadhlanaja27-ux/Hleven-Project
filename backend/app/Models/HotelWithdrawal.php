<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelWithdrawal extends Model
{
    protected $fillable = [
        'hotel_id',
        'destination_id',
        'destination_type',
        'destination_channel_code',
        'destination_account_number',
        'destination_account_name',
        'amount',
        'provider_fee',
        'net_amount',
        'status',
        'provider_reference',
        'idempotency_key',
        'failure_reason',
        'requested_at',
        'processed_at',
    ];

    protected $hidden = [
        'destination_account_number',
    ];

    protected $casts = [
        'destination_account_number' => 'encrypted',
        'amount' => 'decimal:2',
        'provider_fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(HotelPayoutDestination::class, 'destination_id');
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(WalletLedgerEntry::class, 'withdrawal_id');
    }
}
