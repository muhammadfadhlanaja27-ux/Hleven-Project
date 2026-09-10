<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_price_histories', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete(); //[cite: 1]
            $table->decimal('weekday_price', 15, 2); // Harga weekday pada saat riwayat dicatat[cite: 1]
            $table->decimal('weekend_price', 15, 2); // Harga weekend pada saat riwayat dicatat[cite: 1]
            $table->date('effective_from'); // Berlaku mulai[cite: 1]
            $table->date('effective_until')->nullable(); // Berlaku sampai[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_price_histories');
    }
};
