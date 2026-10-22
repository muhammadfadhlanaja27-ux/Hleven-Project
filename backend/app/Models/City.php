<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    public $timestamps = false; // Karena tabel cities tidak menggunakan timestamps

    protected $fillable = ['province', 'city'];

    public function hotels()
    {
        return $this->hasMany(Hotel::class, 'city_id');
    }
}