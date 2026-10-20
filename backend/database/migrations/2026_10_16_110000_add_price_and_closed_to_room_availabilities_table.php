<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_availabilities', function (Blueprint $table) {
            $table->decimal('price', 15, 2)->nullable()->after('booked_room');
            $table->boolean('is_closed')->default(false)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('room_availabilities', function (Blueprint $table) {
            $table->dropColumn(['price', 'is_closed']);
        });
    }
};
