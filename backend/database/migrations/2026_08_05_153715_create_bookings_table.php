<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();//[cite: 1]
            $table->string('booking_code')->unique(); // Kode booking unik[cite: 1]
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict'); // Pemilik booking[cite: 1]
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('restrict'); // Hotel yang dipesan[cite: 1]
            $table->date('check_in'); // Tanggal check-in[cite: 1]
            $table->date('check_out'); // Tanggal check-out[cite: 1]
            $table->integer('total_night'); // Total malam[cite: 1]
            $table->decimal('subtotal', 15, 2); // Total harga kamar[cite: 1]
            $table->decimal('tax', 15, 2); // Pajak[cite: 1]
            $table->decimal('grand_total', 15, 2); // Total pembayaran[cite: 1]
            $table->text('special_request')->nullable(); // Permintaan khusus[cite: 1]
            $table->enum('status', [
                'pending', 'unpaid', 'paid', 'checked_in', 'checked_out', 'cancelled', 'expired', 'refunded'
            ])->default('pending'); // Status booking[cite: 1]
            $table->timestamps();//[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
