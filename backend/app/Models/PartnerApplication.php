<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PartnerApplication extends Model {
    protected $fillable = ['owner_name', 'hotel_name', 'email', 'phone', 'status'];
    public function documents() { return $this->hasMany(PartnerDocument::class, 'partner_application_id'); }
}