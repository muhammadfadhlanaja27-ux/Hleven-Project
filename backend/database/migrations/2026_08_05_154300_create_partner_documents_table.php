<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_documents', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('partner_application_id')->constrained('partner_applications')->cascadeOnDelete(); // Relasi ke pendaftaran partner[cite: 1]
            $table->string('document_type'); // Jenis dokumen (KTP, SIUP, dll)[cite: 1]
            $table->string('file_path'); // Path file dokumen[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_documents');
    }
};
