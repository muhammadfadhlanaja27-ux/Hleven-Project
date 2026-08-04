<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_otps', function (Blueprint $table) {

            $table->id();

            $table->string('email');

            $table->string('otp',10);

            $table->timestamp('expired_at');

            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

            $table->index('email');
            $table->index('expired_at');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_otps');
    }
};