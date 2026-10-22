<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warnings', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete(); // Hotel yang diberi warning[cite: 1]
            $table->foreignId('super_admin_id')->constrained('users')->cascadeOnDelete(); // Super Admin pemberi warning[cite: 1]
            $table->string('title'); // Judul warning[cite: 1]
            $table->text('message'); // Isi warning[cite: 1]
            $table->enum('status', ['unread', 'read', 'closed'])->default('unread'); // Status warning[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warnings');
    }
};
