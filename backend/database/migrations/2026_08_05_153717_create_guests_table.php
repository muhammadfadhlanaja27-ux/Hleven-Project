<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->string('name'); // Nama tamu[cite: 1]
            $table->string('phone'); // Nomor telepon[cite: 1]
            $table->enum('gender', ['Male', 'Female'])->nullable(); // Jenis kelamin[cite: 1]
            $table->string('identity_number'); // Nomor identitas (KTP/Paspor)[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
