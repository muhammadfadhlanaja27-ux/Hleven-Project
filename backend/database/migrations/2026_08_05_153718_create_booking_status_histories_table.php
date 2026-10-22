<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_status_histories', function (Blueprint $table) {
            $table->id(); //[cite: 1]
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete(); //[cite: 1]
            $table->string('old_status')->nullable(); // Status sebelumnya[cite: 1]
            $table->string('new_status'); // Status baru[cite: 1]
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null'); // User yang mengubah[cite: 1]
            $table->timestamp('changed_at'); //[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_status_histories');
    }
};
