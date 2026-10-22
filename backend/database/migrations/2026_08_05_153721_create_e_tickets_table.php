<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('e_tickets', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->string('qr_code')->unique(); // Data string unik untuk QR Code[cite: 1]
            $table->string('pdf_path')->nullable(); // Lokasi file PDF (Checkpoint 2)[cite: 1]
            $table->timestamp('generated_at'); //[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('e_tickets');
    }
};
