<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('hotel_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('photo');

            $table->boolean('is_thumbnail')->default(false);

            $table->timestamps();

            $table->index('hotel_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_photos');
    }
};