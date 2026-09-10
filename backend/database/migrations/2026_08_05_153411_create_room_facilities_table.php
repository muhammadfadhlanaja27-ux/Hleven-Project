<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_facilities', function (Blueprint $table) {
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete(); //[cite: 1]
            $table->foreignId('facility_id')->constrained('facilities')->cascadeOnDelete(); //[cite: 1]

            // Composite Primary Key[cite: 1]
            $table->primary(['room_type_id', 'facility_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_facilities');
    }
};
