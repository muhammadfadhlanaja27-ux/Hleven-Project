<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->id(); // bigint, Primary Key[cite: 1]
            $table->string('name')->unique(); // Nama fasilitas harus unik[cite: 1]
            $table->enum('category', ['Hotel', 'Room', 'Bathroom']); // Kategori fasilitas[cite: 1]
            $table->softDeletes(); // Direkomendasikan menggunakan Soft Delete[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
