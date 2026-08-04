<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->enum('role', [
                'user',
                'admin_hotel',
                'super_admin',
            ])->default('user');

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            $table->string('phone', 20)->nullable();
            $table->string('avatar')->nullable();

            $table->string('google_id')->nullable()->unique();

            $table->timestamp('email_verified_at')->nullable();

            $table->enum('status', [
                'Active',
                'Inactive',
                'Blocked',
            ])->default('Active');

            $table->rememberToken();

            $table->timestamps();

            $table->index('role');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};