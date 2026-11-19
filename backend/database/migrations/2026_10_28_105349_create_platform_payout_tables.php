<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pengaturan pencairan otomatis
        Schema::create('platform_payout_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('payout_day')->default(1);
            $table->boolean('is_active')->default(false);
            $table->string('target_email')->nullable();
            $table->timestamps();
        });

        // Riwayat pencairan komisi
        Schema::create('platform_payouts', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->string('reference')->nullable();
            $table->text('admin_note')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_payout_settings');
        Schema::dropIfExists('platform_payouts');
    }
};
