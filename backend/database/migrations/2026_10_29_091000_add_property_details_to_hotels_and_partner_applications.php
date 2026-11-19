<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->string('property_type', 100)->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
        });

        Schema::table('partner_applications', function (Blueprint $table) {
            $table->string('property_type', 100)->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn(['property_type', 'year_built']);
        });

        Schema::table('partner_applications', function (Blueprint $table) {
            $table->dropColumn(['property_type', 'year_built']);
        });
    }
};
