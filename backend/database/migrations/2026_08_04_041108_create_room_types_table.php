<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {

            $table->id();

            $table->foreignId('hotel_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('name');

            $table->text('description')->nullable();

            $table->decimal('weekday_price',12,2);

            $table->decimal('weekend_price',12,2);

            $table->integer('stock');

            $table->integer('capacity_adult');

            $table->integer('capacity_child')->default(0);

            $table->boolean('breakfast')->default(false);

            $table->boolean('smoking_area')->default(false);

            $table->timestamps();

            $table->index('hotel_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};