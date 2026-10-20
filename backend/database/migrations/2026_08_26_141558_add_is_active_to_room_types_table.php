<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('room_types', 'is_active')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('is_refundable');
            });
        }

        // Keep previously inserted data active by default if null.
        \Illuminate\Support\Facades\DB::table('room_types')->whereNull('is_active')->update(['is_active' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'is_active')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
