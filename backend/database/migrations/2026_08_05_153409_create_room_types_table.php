<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete(); // Hotel pemilik[cite: 1]
            $table->string('name'); // Nama kamar[cite: 1]
            $table->text('description')->nullable(); // Deskripsi[cite: 1]
            $table->decimal('weekday_price', 15, 2); // Harga weekday[cite: 1]
            $table->decimal('weekend_price', 15, 2); // Harga weekend[cite: 1]
            $table->integer('stock'); // Total stok[cite: 1]
            $table->integer('capacity_adult'); // Kapasitas dewasa[cite: 1]
            $table->integer('capacity_child'); // Kapasitas anak[cite: 1]
            $table->boolean('breakfast')->default(false); // Termasuk sarapan[cite: 1]
            $table->boolean('smoking_area')->default(false); // Area merokok[cite: 1]
            $table->timestamps(); //[cite: 1]
            $table->softDeletes(); // Direkomendasikan menggunakan Soft Delete[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
