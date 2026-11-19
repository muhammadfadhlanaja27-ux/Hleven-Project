<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // online = bayar via Midtrans, pay_at_hotel = bayar saat check-in
            $table->enum('payment_method', ['online', 'pay_at_hotel'])
                ->default('online')
                ->after('status');
        });

        Schema::table('hotels', function (Blueprint $table) {
            // Hotel memutuskan sendiri apakah menerima pembayaran di tempat
            $table->boolean('allow_pay_at_hotel')->default(false)->after('tax_rate');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('allow_pay_at_hotel');
        });
    }
};
