<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_status_histories', function (Blueprint $table) {

            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->enum('old_status',[
                'Pending',
                'Unpaid',
                'Paid',
                'Checked_In',
                'Checked_Out',
                'Cancelled',
                'Expired'
            ])->nullable();

            $table->enum('new_status',[
                'Pending',
                'Unpaid',
                'Paid',
                'Checked_In',
                'Checked_Out',
                'Cancelled',
                'Expired'
            ]);

            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->timestamp('changed_at');

            $table->timestamps();

            $table->index('booking_id');
            $table->index('changed_by');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_status_histories');
    }
};