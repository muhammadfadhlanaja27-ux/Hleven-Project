<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('facilities', 'hotel_id')) {
            Schema::table('facilities', function (Blueprint $table) {
                $table->foreignId('hotel_id')->nullable()->after('id')->constrained('hotels')->cascadeOnDelete();
            });
        }

        try {
            Schema::table('facilities', function (Blueprint $table) {
                $table->dropUnique(['name']);
            });
        } catch (\Throwable $e) {
            // Abaikan jika unique constraint sudah terhapus
        }

        // Set hotel_id untuk Gym (ID 17) ke Padma Hotel (ID 15)
        DB::table('facilities')->where('name', 'Gym')->update(['hotel_id' => 15]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('facilities', 'hotel_id')) {
            Schema::table('facilities', function (Blueprint $table) {
                $table->dropForeign(['hotel_id']);
                $table->dropColumn('hotel_id');
            });
        }
    }
};
