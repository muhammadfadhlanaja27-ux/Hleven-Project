<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facilities', function (Blueprint $table) {
            $table->string('icon')->nullable()->default('star')->after('category');
            $table->text('description')->nullable()->after('icon');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('facilities', function (Blueprint $table) {
            $table->dropColumn(['icon', 'description', 'status', 'created_at', 'updated_at']);
        });
    }
};
