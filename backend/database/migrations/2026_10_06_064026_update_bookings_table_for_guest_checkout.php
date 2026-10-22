<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Mengubah user_id menjadi nullable untuk Guest Checkout
            $table->foreignId('user_id')->nullable()->change();

            // Data Pemesan Utama
            if (!Schema::hasColumn('bookings', 'booker_name')) {
                $table->string('booker_name')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('bookings', 'booker_email')) {
                $table->string('booker_email')->nullable()->after('booker_name');
            }
            if (!Schema::hasColumn('bookings', 'booker_phone')) {
                $table->string('booker_phone')->nullable()->after('booker_email');
            }

            // Data Tamu Menginap
            if (!Schema::hasColumn('bookings', 'is_for_other_guest')) {
                $table->boolean('is_for_other_guest')->default(false)->after('booker_phone');
            }
            if (!Schema::hasColumn('bookings', 'guest_name')) {
                $table->string('guest_name')->nullable()->after('is_for_other_guest');
            }
            if (!Schema::hasColumn('bookings', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }
            if (!Schema::hasColumn('bookings', 'guest_phone')) {
                $table->string('guest_phone')->nullable()->after('guest_email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();

            $columns = array_filter(
                ['booker_name', 'booker_email', 'booker_phone', 'is_for_other_guest', 'guest_name', 'guest_email', 'guest_phone'],
                fn ($column) => Schema::hasColumn('bookings', $column)
            );

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
