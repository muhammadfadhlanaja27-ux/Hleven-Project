<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            
            // user_id dibuat nullable agar mendukung Guest Checkout (pemesanan tanpa login)
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('restrict');
            
            // Kolom pendukung pemesanan untuk orang lain & guest checkout
            $table->boolean('is_for_other_guest')->default(false);
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();

            $table->date('check_in');
            $table->date('check_out');
            $table->integer('total_night');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax', 15, 2);
            $table->decimal('grand_total', 15, 2);
            $table->text('special_request')->nullable();
            $table->enum('status', [
                'pending', 'unpaid', 'paid', 'checked_in', 'checked_out', 'cancelled', 'expired', 'refunded'
            ])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};