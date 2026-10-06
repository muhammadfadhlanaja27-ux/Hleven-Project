<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partner_applications', function (Blueprint $table) {
            if (Schema::hasColumn('partner_applications', 'hotel_type')) {
                $table->dropColumn('hotel_type');
            }
            if (Schema::hasColumn('partner_applications', 'room_count')) {
                $table->dropColumn('room_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('partner_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('partner_applications', 'hotel_type')) {
                $table->string('hotel_type')->nullable()->after('hotel_name');
            }
            if (!Schema::hasColumn('partner_applications', 'room_count')) {
                $table->unsignedInteger('room_count')->nullable()->after('hotel_email');
            }
        });
    }
};
