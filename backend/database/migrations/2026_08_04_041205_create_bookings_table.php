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

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('hotel_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->date('check_in');

            $table->date('check_out');

            $table->unsignedInteger('total_night');

            $table->enum('status',[
                'Pending',
                'Unpaid',
                'Paid',
                'Checked_In',
                'Checked_Out',
                'Cancelled',
                'Expired'
            ])->default('Pending');

            $table->decimal('subtotal',12,2);

            $table->decimal('tax',12,2)->default(0);

            $table->decimal('grand_total',12,2);

            $table->text('special_request')->nullable();

            $table->timestamps();

            $table->index('booking_code');
            $table->index('status');
            $table->index(['user_id','status']);
            $table->index(['hotel_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};