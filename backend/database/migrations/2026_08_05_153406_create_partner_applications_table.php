<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_applications', function (Blueprint $table) {
            $table->id();
            $table->string('owner_name'); //
            $table->string('hotel_name'); //[cite: 1]
            $table->string('email'); //[cite: 1]
            $table->string('phone'); //[cite: 1]
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); //[cite: 1]
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_applications');
    }
};
