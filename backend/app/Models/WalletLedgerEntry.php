<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletLedgerEntry extends Model
{
    protected $fillable = [
        'account_type',
        'hotel_id',
        'booking_id',
        'withdrawal_id',
        'entry_type',
        'bucket',
        'amount',
        'currency',
        'idempotency_key',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function withdrawal(): BelongsTo
    {
        return $this->belongsTo(HotelWithdrawal::class, 'withdrawal_id');
    }
}
