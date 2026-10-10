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
        'is_for_other_guest',
        'guest_name',
        'guest_email',
        'guest_phone',
        'check_in',
        'check_out',
        'total_night',
        'subtotal',
        'tax',
        'grand_total',
        'special_request',
        'status'
    ];

    protected $casts = [
        'is_for_other_guest' => 'boolean',
        'check_in' => 'date',
        'check_out' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    /**
     * Accessor: Mendapatkan Nama Pemesan (Akun Pembeli)
     */
    public function getBookerNameAttribute(): ?string
    {
        return $this->user ? $this->user->name : $this->guest_name;
    }

    /**
     * Accessor: Mendapatkan Email Pemesan
     */
    public function getBookerEmailAttribute(): ?string
    {
        return $this->user ? $this->user->email : $this->guest_email;
    }

    /**
     * Accessor: Mendapatkan No. HP Pemesan
     */
    public function getBookerPhoneAttribute(): ?string
    {
        return $this->user ? $this->user->phone : $this->guest_phone;
    }

    /**
     * Accessor: Mendapatkan Nama Tamu yang Menginap
     */
    public function getStayingGuestNameAttribute(): ?string
    {
        if ($this->is_for_other_guest) {
            return $this->guest_name;
        }

        return $this->user ? $this->user->name : $this->guest_name;
    }

    /**
     * Accessor: Mendapatkan Email Tamu yang Menginap
     */
    public function getStayingGuestEmailAttribute(): ?string
    {
        if ($this->is_for_other_guest) {
            return $this->guest_email;
        }

        return $this->user ? $this->user->email : $this->guest_email;
    }

    /**
     * Accessor: Mendapatkan No. HP Tamu yang Menginap
     */
    public function getStayingGuestPhoneAttribute(): ?string
    {
        if ($this->is_for_other_guest) {
            return $this->guest_phone;
        }

        return $this->user ? $this->user->phone : $this->guest_phone;
    }

    // --- Relasi Eloquent ---

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
}