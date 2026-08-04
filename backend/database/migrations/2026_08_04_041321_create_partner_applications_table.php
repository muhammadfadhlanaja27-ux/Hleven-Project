<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_applications', function (Blueprint $table) {

            $table->id();

            $table->string('owner_name');

            $table->string('hotel_name');

            $table->string('email');

            $table->string('phone',20);

            $table->enum('status',[
                'Pending',
                'Approved',
                'Rejected'
            ])->default('Pending');

            $table->timestamps();

            $table->index('status');
            $table->index('email');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_applications');
    }
};