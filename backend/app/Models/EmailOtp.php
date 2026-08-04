<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'email',
        'otp',
        'expired_at',
        'verified_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'expired_at' => 'datetime',
            'verified_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }
}