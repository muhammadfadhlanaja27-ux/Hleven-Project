<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->string('payment_method')->nullable(); //[cite: 1]
            $table->enum('payment_status', ['pending', 'success', 'failed', 'expired', 'cancelled'])->default('pending'); //[cite: 1]
            $table->decimal('gross_amount', 15, 2); //[cite: 1]
            $table->string('transaction_id')->nullable(); //[cite: 1]
            $table->string('order_id')->nullable()->unique(); //[cite: 1]
            $table->string('snap_token')->nullable(); //[cite: 1]
            $table->timestamp('paid_at')->nullable(); //[cite: 1]
            $table->timestamp('expired_at')->nullable(); //[cite: 1]
            $table->timestamps(); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
