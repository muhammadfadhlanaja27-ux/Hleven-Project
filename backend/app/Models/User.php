<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'role', 'name', 'email', 'password', 'phone', 'avatar', 'google_id', 'email_verified_at', 'status'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Accessor tambahan agar React tetap mendapatkan first_name & last_name
    protected $appends = ['first_name', 'last_name'];

    public function getFirstNameAttribute()
    {
        return explode(' ', $this->name)[0] ?? $this->name;
    }

    public function getLastNameAttribute()
    {
        $parts = explode(' ', $this->name);
        array_shift($parts);
        return implode(' ', $parts);
    }

    public function hotel()
    {
        return $this->hasOne(Hotel::class, 'admin_id');
    }

    public function hotels()
    {
        return $this->hasMany(Hotel::class, 'admin_id');
    }

    public function hotel()
    {
        return $this->hasOne(Hotel::class, 'admin_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }
}