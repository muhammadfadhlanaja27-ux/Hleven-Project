<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warnings', function (Blueprint $table) {

            $table->id();

            $table->foreignId('hotel_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('super_admin_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('title');

            $table->text('message');

            $table->enum('status',[
                'Unread',
                'Read',
                'Closed'
            ])->default('Unread');

            $table->timestamps();

            $table->index('hotel_id');
            $table->index('super_admin_id');
            $table->index('status');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warnings');
    }
};