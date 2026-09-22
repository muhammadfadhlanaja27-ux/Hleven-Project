<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // Hapus Foreign Key lama jika ada
        try {
            Schema::table('hotels', function (Blueprint $table) {
                $table->dropForeign(['admin_id']);
            });
        } catch (\Throwable $e) {
            // Abaikan
        }

        // Tambahkan Foreign Key constraint ON DELETE CASCADE
        Schema::table('hotels', function (Blueprint $table) {
            $table->foreign('admin_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        try {
            Schema::table('hotels', function (Blueprint $table) {
                $table->dropForeign(['admin_id']);
            });
        } catch (\Throwable $e) {
            // Abaikan
        }

        Schema::enableForeignKeyConstraints();
    }
};