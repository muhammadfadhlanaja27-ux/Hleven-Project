<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerDocument extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'partner_application_id',
        'file',
        'document_type',
        'verified',
        'uploaded_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
            'uploaded_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function partnerApplication(): BelongsTo
    {
        return $this->belongsTo(PartnerApplication::class);
    }
}