<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Pemilik notifikasi
            $table->string('title'); // Judul notifikasi
            $table->text('message'); // Isi notifikasi
            $table->string('type'); // Jenis notifikasi
            $table->boolean('is_read')->default(false); // Status dibaca
            $table->timestamp('created_at')->useCurrent(); // Waktu dibuat[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
