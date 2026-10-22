<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PartnerDocument extends Model {
    protected $fillable = ['partner_application_id', 'document_type', 'file_path'];
    public function application() { return $this->belongsTo(PartnerApplication::class, 'partner_application_id'); }
}