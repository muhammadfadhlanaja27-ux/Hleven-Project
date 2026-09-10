<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partner_applications', function (Blueprint $table) {
            $table->string('owner_email')->nullable()->after('owner_name');
            $table->string('owner_phone')->nullable()->after('owner_email');
        });
    }

    public function down(): void
    {
        Schema::table('partner_applications', function (Blueprint $table) {
            $table->dropColumn(['owner_email', 'owner_phone']);
        });
    }
};
