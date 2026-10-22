<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_facilities', function (Blueprint $table) {
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete(); //[cite: 1]
            $table->foreignId('facility_id')->constrained('facilities')->cascadeOnDelete(); //[cite: 1]

            // Composite Primary Key[cite: 1]
            $table->primary(['hotel_id', 'facility_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_facilities');
    }
};
