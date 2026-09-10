<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // User yang melakukan aktivitas[cite: 1]
            $table->string('activity'); // Nama aktivitas[cite: 1]
            $table->text('description')->nullable(); // Detail aktivitas[cite: 1]
            $table->string('ip_address')->nullable(); // Alamat IP[cite: 1]
            $table->timestamp('created_at')->useCurrent(); // Waktu aktivitas[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
