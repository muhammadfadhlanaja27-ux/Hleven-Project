<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_rooms', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->foreignId('room_type_id')->constrained('room_types')->onDelete('restrict'); //[cite: 1]
            $table->integer('qty'); // Jumlah kamar[cite: 1]
            $table->decimal('price_per_night', 15, 2); // Snapshot harga saat booking[cite: 1]
            $table->decimal('subtotal', 15, 2);//[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_rooms');
    }
};
