<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id(); // bigint, Primary Key[cite: 1]
            $table->string('province'); // Nama provinsi[cite: 1]
            $table->string('city'); // Nama kota[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
