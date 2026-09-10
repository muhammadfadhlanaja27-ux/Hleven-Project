<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete(); //[cite: 1]
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); //[cite: 1]
            $table->integer('rating'); // Skala 1 - 5[cite: 1]
            $table->text('comment')->nullable(); // Komentar pengguna[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
