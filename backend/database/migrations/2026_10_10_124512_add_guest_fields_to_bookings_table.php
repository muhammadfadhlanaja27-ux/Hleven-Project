<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'is_for_other_guest')) {
                $table->boolean('is_for_other_guest')->default(false)->after('hotel_id');
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
            $columns = array_filter(
                ['is_for_other_guest', 'guest_name', 'guest_email', 'guest_phone'],
                fn ($column) => Schema::hasColumn('bookings', $column)
            );

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
