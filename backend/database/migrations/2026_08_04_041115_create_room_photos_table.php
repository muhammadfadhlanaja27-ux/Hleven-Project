<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_photos', function (Blueprint $table) {

            $table->id();

            $table->foreignId('room_type_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('photo');

            $table->boolean('is_thumbnail')->default(false);

            $table->timestamps();

            $table->index('room_type_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_photos');
    }
};