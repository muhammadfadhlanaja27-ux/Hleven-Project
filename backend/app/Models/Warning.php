<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Warning extends Model {
    protected $fillable = ['hotel_id', 'super_admin_id', 'title', 'message', 'status'];
    public function hotel() { return $this->belongsTo(Hotel::class, 'hotel_id'); }
    public function admin() { return $this->belongsTo(User::class, 'super_admin_id'); }
}