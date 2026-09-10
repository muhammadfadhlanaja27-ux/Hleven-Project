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

        // 1. Pastikan users.id diset sebagai Primary Key jika indeksnya hilang
        try {
            DB::statement("ALTER TABLE `users` ADD PRIMARY KEY (`id`);");
        } catch (\Throwable $e) {
            // Abaikan jika users.id sudah memiliki Primary Key
        }

        // 2. Set users.id dan hotels.admin_id agar bertipe BIGINT UNSIGNED
        DB::statement("ALTER TABLE `users` MODIFY `id` BIGINT UNSIGNED AUTO_INCREMENT;");
        DB::statement("ALTER TABLE `hotels` MODIFY `admin_id` BIGINT UNSIGNED NULL;");

        // 3. Hapus Foreign Key lama jika ada
        try {
            Schema::table('hotels', function (Blueprint $table) {
                $table->dropForeign(['admin_id']);
            });
        } catch (\Throwable $e) {
            // Abaikan
        }

        // 4. Tambahkan Foreign Key constraint ON DELETE CASCADE
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