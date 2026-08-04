<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('booking_id')
                ->unique()
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->enum('payment_method',[
                'QRIS'
            ]);

            $table->enum('payment_status',[
                'Pending',
                'Success',
                'Failed',
                'Expired',
                'Cancelled'
            ])->default('Pending');

            $table->string('transaction_id')->nullable()->unique();

            $table->string('order_id')->nullable()->unique();

            $table->text('snap_token')->nullable();

            $table->decimal('gross_amount',12,2);

            $table->timestamp('paid_at')->nullable();

            $table->timestamp('expired_at')->nullable();

            $table->timestamps();

            $table->index('payment_status');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};