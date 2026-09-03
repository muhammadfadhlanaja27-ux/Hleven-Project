<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
        });

        DB::statement('ALTER TABLE hotels ADD CONSTRAINT hotels_admin_id_foreign FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE hotels DROP CONSTRAINT hotels_admin_id_foreign');

        Schema::table('hotels', function (Blueprint $table) {
            $table->foreign('admin_id')->references('id')->on('users')->restrictOnDelete();
        });
    }
};
