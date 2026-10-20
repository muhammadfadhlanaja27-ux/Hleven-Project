<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_payout_destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->string('channel_code', 80);
            $table->text('account_number');
            $table->string('account_name');
            $table->string('provider_recipient_id')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['hotel_id', 'status']);
        });

        Schema::create('hotel_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('destination_id')->nullable()->constrained('hotel_payout_destinations')->nullOnDelete();
            $table->string('destination_type', 20);
            $table->string('destination_channel_code', 80);
            $table->text('destination_account_number');
            $table->string('destination_account_name');
            $table->decimal('amount', 14, 2);
            $table->decimal('provider_fee', 14, 2)->default(0);
            $table->decimal('net_amount', 14, 2);
            $table->string('status', 20)->default('requested');
            $table->string('provider_reference')->nullable();
            $table->string('idempotency_key')->unique();
            $table->text('failure_reason')->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['hotel_id', 'status']);
            $table->index('provider_reference');
        });

        Schema::create('wallet_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->string('account_type', 20);
            $table->foreignId('hotel_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('withdrawal_id')->nullable()->constrained('hotel_withdrawals')->nullOnDelete();
            $table->string('entry_type', 30);
            $table->string('bucket', 20);
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3)->default('IDR');
            $table->string('idempotency_key')->unique();
            $table->string('description');
            $table->timestamps();

            $table->index(['account_type', 'hotel_id', 'bucket']);
            $table->index(['booking_id', 'entry_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_ledger_entries');
        Schema::dropIfExists('hotel_withdrawals');
        Schema::dropIfExists('hotel_payout_destinations');
    }
};
