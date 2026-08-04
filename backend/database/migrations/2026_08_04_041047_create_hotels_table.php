<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();

            $table->foreignId('admin_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('city_id')
                ->constrained('cities')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('name');
            $table->string('slug')->unique();

            $table->text('description')->nullable();
            $table->text('address');

            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_review')->default(0);

            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            $table->enum('status', [
                'Active',
                'Blocked',
            ])->default('Active');

            $table->timestamps();

            $table->index('admin_id');
            $table->index('city_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};