<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->unsignedTinyInteger('star_rating')->nullable()->after('status');
            $table->foreignId('star_verified_by')->nullable()->after('star_rating')->constrained('users')->nullOnDelete();
            $table->timestamp('star_verified_at')->nullable()->after('star_verified_by');
            $table->text('star_verified_reason')->nullable()->after('star_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropForeign(['star_verified_by']);
            $table->dropColumn(['star_rating', 'star_verified_by', 'star_verified_at', 'star_verified_reason']);
        });
    }
};
