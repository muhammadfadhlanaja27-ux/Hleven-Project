<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('room_types', 'bed_type_id')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->foreignId('bed_type_id')
                    ->nullable()
                    ->after('hotel_id')
                    ->constrained('bed_types')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'bed_type_id')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropConstrainedForeignId('bed_type_id');
            });
        }
    }
};
