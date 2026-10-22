<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // bigint, Primary Key[cite: 1]
            $table->enum('role', ['user', 'admin_hotel', 'super_admin'])->default('user'); //[cite: 1]
            $table->string('name'); //[cite: 1]
            $table->string('email')->unique(); // Email harus unik[cite: 1]
            $table->string('password'); //[cite: 1]
            $table->string('phone')->nullable(); //[cite: 1]
            $table->string('avatar')->nullable(); //[cite: 1]
            $table->string('google_id')->nullable(); // Future Development[cite: 1]
            $table->timestamp('email_verified_at')->nullable(); // Future Development[cite: 1]
            $table->enum('status', ['active', 'blocked', 'inactive'])->default('active'); // Status akun[cite: 1]
            $table->rememberToken(); // Laravel Remember Token[cite: 1]
            $table->timestamps(); // created_at dan updated_at[cite: 1]
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
