<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id(); // bigint, Primary Key[cite: 1]

            // Foreign Keys
            $table->foreignId('admin_id')->constrained('users')->onDelete('restrict'); // FK ke users[cite: 1]
            $table->foreignId('city_id')->constrained('cities')->onDelete('restrict'); // FK ke cities[cite: 1]

            // Kolom Data
            $table->string('name'); //[cite: 1]
            $table->string('slug')->unique(); // URL Slug, harus unik[cite: 1]
            $table->text('description')->nullable(); //[cite: 1]
            $table->text('address'); //[cite: 1]

            // Statistik (Dihitung otomatis via relasi)
            $table->decimal('average_rating', 3, 2)->default(0.00); // Rating rata-rata[cite: 1]
            $table->integer('total_review')->default(0); // Jumlah review[cite: 1]

            // Maps
            $table->decimal('latitude', 10, 8)->nullable(); //[cite: 1]
            $table->decimal('longitude', 11, 8)->nullable(); //[cite: 1]

            // Status & Timestamps
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('inactive'); // Status hotel[cite: 1]
            $table->timestamps(); // created_at, updated_at[cite: 1]
            $table->softDeletes(); // Direkomendasikan menggunakan Soft Delete[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
