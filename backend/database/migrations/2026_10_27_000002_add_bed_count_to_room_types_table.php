<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('room_types', 'bed_count')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->unsignedInteger('bed_count')->default(1)->after('bed_type_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'bed_count')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropColumn('bed_count');
            });
        }
    }
};
