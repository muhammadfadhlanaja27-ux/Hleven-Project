<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_price_histories', function (Blueprint $table) {

            $table->id();

            $table->foreignId('room_type_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->decimal('weekday_price',12,2);

            $table->decimal('weekend_price',12,2);

            $table->timestamp('effective_from');

            $table->timestamp('effective_until')->nullable();

            $table->timestamps();

            $table->index('room_type_id');

            $table->index([
                'room_type_id',
                'effective_from'
            ]);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_price_histories');
    }
};