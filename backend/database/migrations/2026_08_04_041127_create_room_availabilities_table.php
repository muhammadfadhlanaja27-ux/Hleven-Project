<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_availabilities', function (Blueprint $table) {

            $table->id();

            $table->foreignId('room_type_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->date('date');

            $table->integer('available_stock');

            $table->integer('booked_room')->default(0);

            $table->timestamps();

            $table->index([
                'room_type_id',
                'date'
            ]);

            $table->unique([
                'room_type_id',
                'date'
            ]);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_availabilities');
    }
};