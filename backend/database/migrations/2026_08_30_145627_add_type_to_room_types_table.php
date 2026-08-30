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
        if (!Schema::hasColumn('room_types', 'type')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->string('type', 100)->nullable()->default('Standard')->after('name');
            });
        }

        // Isi default type untuk data yang sudah ada berdasarkan namanya
        $rooms = DB::table('room_types')->get();
        foreach ($rooms as $room) {
            $name = strtolower($room->name ?? '');
            $type = 'Standard';
            if (str_contains($name, 'suite')) {
                $type = 'Suite';
            } elseif (str_contains($name, 'deluxe')) {
                $type = 'Deluxe';
            }
            DB::table('room_types')->where('id', $room->id)->update(['type' => $type]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'type')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }
};
