<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete(); // Cascade delete jika hotel dihapus permanen[cite: 1]
            $table->string('photo'); // Path gambar[cite: 1]
            $table->boolean('is_thumbnail')->default(false); // Penanda foto utama[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_photos');
    }
};
