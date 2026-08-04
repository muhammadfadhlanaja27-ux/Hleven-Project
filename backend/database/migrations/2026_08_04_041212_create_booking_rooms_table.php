<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_rooms', function (Blueprint $table) {

            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('room_type_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->unsignedInteger('qty');

            $table->decimal('price_per_night',12,2);

            $table->decimal('subtotal',12,2);

            $table->timestamps();

            $table->index('booking_id');
            $table->index('room_type_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_rooms');
    }
};