<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {

            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('phone',20);

            $table->enum('gender',[
                'Male',
                'Female'
            ])->nullable();

            $table->string('identity_number')->nullable();

            $table->timestamps();

            $table->index('booking_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};