<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->foreignId('requested_by')->constrained('users')->onDelete('restrict'); //[cite: 1]
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); //[cite: 1]
            $table->text('reason'); // Alasan refund[cite: 1]
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending'); //[cite: 1]
            $table->timestamp('requested_at'); //[cite: 1]
            $table->timestamp('approved_at')->nullable(); //[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
