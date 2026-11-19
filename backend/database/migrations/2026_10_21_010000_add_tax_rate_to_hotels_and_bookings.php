<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(5.00)->after('policies');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->nullable()->after('tax');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('tax_rate');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('tax_rate');
        });
    }
};
