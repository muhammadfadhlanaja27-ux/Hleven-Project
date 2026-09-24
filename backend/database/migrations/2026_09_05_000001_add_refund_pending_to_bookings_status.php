<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','unpaid','paid','confirmed','checked_in','checked_out','cancelled','expired','refunded','refund_pending') DEFAULT 'pending'");
        } elseif ($driver === 'pgsql') {
            DB::statement("ALTER TYPE bookings_status ADD VALUE IF NOT EXISTS 'refund_pending'");
            DB::statement("ALTER TYPE bookings_status ADD VALUE IF NOT EXISTS 'confirmed'");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','unpaid','paid','checked_in','checked_out','cancelled','expired','refunded') DEFAULT 'pending'");
        }
    }
};
