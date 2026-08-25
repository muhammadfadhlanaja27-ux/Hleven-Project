<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class PartnerApplication extends Model
{
    protected $fillable = [
        'user_id',
        'application_number',
        'owner_name',
        'owner_email',
        'owner_phone',
        'owner_id_number',
        'hotel_name',
        'hotel_type',
        'hotel_description',
        'hotel_phone',
        'hotel_email',
        'room_count',
        'email',
        'phone',
        'address',
        'province',
        'city',
        'district',
        'postal_code',
        'maps_url',
        'latitude',
        'longitude',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'status',
        'rejection_reason',
        'revision_notes',
    ];

    protected $casts = [
        'room_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $application) {
            if (empty($application->application_number)) {
                $application->application_number = 'HLVN-MIT-' . strtoupper(Str::random(8));
            }
            if (empty($application->email) && !empty($application->owner_email)) {
                $application->email = $application->owner_email;
            }
            if (empty($application->phone) && !empty($application->owner_phone)) {
                $application->phone = $application->owner_phone;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PartnerDocument::class, 'partner_application_id');
    }
}