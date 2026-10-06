<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            if (!Schema::hasColumn('guests', 'email')) {
                $table->string('email')->nullable()->after('name');
            }
            if (!Schema::hasColumn('guests', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('guests', 'identity_number')) {
                $table->string('identity_number')->nullable()->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['email', 'phone', 'identity_number']);
        });
    }
};