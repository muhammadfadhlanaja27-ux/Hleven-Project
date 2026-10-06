<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'hotel_id',
        'check_in',
        'check_out',
        'total_night',
        'children_count',
        'subtotal',
        'tax',
        'grand_total',
        'special_request',
        'status',

        // Data Pemesan Utama (Guest Checkout)
        'booker_name',
        'booker_email',
        'booker_phone',

        // Data Tamu Menginap (Pesan untuk orang lain)
        'is_for_other_guest',
        'guest_name',
        'guest_email',
        'guest_phone',
    ];

    protected $casts = [
        'children_count'     => 'integer',
        'is_for_other_guest' => 'boolean',
        'check_in'           => 'date',
        'check_out'          => 'date',
    ];

    protected $appends = [
        'is_refundable',
        'primary_booker_name',
        'primary_booker_email',
        'primary_booker_phone',
        'actual_guest_name',
        'actual_guest_email',
        'actual_guest_phone',
    ];

    /* -------------------------------------------------------------------------- */
    /*                                RELASI MODEL                                */
    /* -------------------------------------------------------------------------- */

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function bookingRooms()
    {
        return $this->hasMany(BookingRoom::class, 'booking_id');
    }

    public function guests()
    {
        return $this->hasMany(Guest::class, 'booking_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'booking_id');
    }

    public function refund()
    {
        return $this->hasOne(Refund::class, 'booking_id');
    }

    public function eTicket()
    {
        return $this->hasOne(ETicket::class, 'booking_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'booking_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(BookingStatusHistory::class, 'booking_id');
    }

    /* -------------------------------------------------------------------------- */
    /*                                  ACCESSORS                                 */
    /* -------------------------------------------------------------------------- */

    public function getIsRefundableAttribute(): bool
    {
        if (! $this->relationLoaded('bookingRooms')) {
            return true;
        }
        if ($this->bookingRooms->isEmpty()) {
            return true;
        }
        return $this->bookingRooms->every(fn ($br) => (bool) ($br->roomType?->is_refundable ?? true));
    }

    // Accessor Data Pemesan Utama (Fallback ke kolom booker_* jika user_id null / Guest Checkout)
    public function getPrimaryBookerNameAttribute(): string
    {
        return $this->user ? $this->user->name : ($this->booker_name ?? 'Guest');
    }

    public function getPrimaryBookerEmailAttribute(): string
    {
        return $this->user ? $this->user->email : ($this->booker_email ?? '-');
    }

    public function getPrimaryBookerPhoneAttribute(): string
    {
        return $this->user ? ($this->user->phone ?? $this->booker_phone) : ($this->booker_phone ?? '-');
    }

    // Accessor Data Tamu Menginap (Fallback ke Pemesan Utama jika is_for_other_guest = false)
    public function getActualGuestNameAttribute(): string
    {
        return $this->is_for_other_guest ? ($this->guest_name ?? $this->primary_booker_name) : $this->primary_booker_name;
    }

    public function getActualGuestEmailAttribute(): string
    {
        return $this->is_for_other_guest ? ($this->guest_email ?? $this->primary_booker_email) : $this->primary_booker_email;
    }

    public function getActualGuestPhoneAttribute(): string
    {
        return $this->is_for_other_guest ? ($this->guest_phone ?? $this->primary_booker_phone) : $this->primary_booker_phone;
    }
}