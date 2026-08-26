<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_availabilities', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete(); //[cite: 1]
            $table->date('date'); // Tanggal ketersediaan[cite: 1]
            $table->integer('available_stock'); // Sisa kamar[cite: 1]
            $table->integer('booked_room')->default(0); // Jumlah kamar dipesan[cite: 1]
            $table->timestamps(); //[cite: 1]

            // Composite Index untuk mempercepat query pencarian stok berdasarkan tanggal[cite: 1]
            $table->index(['room_type_id', 'date']);
            // Unique Constraint memastikan tidak ada duplikasi data per kamar di tanggal yang sama[cite: 1]
            $table->unique(['room_type_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_availabilities');
    }
};
