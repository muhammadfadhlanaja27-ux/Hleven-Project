<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    // 1. Hapus FK lama jika ada
    try {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
        });
    } catch (\Throwable $e) {
        // Abaikan jika FK tidak ditemukan
    }

    // 2. Samakan tipe admin_id dengan users.id (BIGINT UNSIGNED)
    DB::statement("ALTER TABLE `hotels` MODIFY `admin_id` BIGINT UNSIGNED NULL;");

    // 3. Buat ulang FK constraint ON DELETE CASCADE
    Schema::table('hotels', function (Blueprint $table) {
        $table->foreign('admin_id')
              ->references('id')
              ->on('users')
              ->onDelete('cascade');
    });
}

    public function down(): void
    {
        try {
            Schema::table('hotels', function (Blueprint $table) {
                $table->dropForeign(['admin_id']);
            });
        } catch (\Throwable $e) {
            // Abaikan
        }
    }
};