<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount',
        'status',
        'reference',
        'admin_note',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'confirmed_at' => 'datetime',
    ];

    public function confirmer()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
