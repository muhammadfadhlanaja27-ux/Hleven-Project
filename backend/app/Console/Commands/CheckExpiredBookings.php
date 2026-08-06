<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;
use App\Services\RoomAvailabilityService;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class CheckExpiredBookings extends Command
{
    /**
     * Nama dan signature dari command.
     */
    protected $signature = 'booking:check-expired';

    /**
     * Deskripsi command.
     */
    protected $description = 'Mengecek dan membatalkan booking yang melewati batas waktu pembayaran';

    /**
     * Eksekusi command.
     */
    public function handle(RoomAvailabilityService $roomAvailabilityService)
    {
        // Cari payment yang statusnya masih Pending dan waktunya sudah lewat[cite: 1]
        $expiredPayments = Payment::with('booking')
            ->where('payment_status', 'Pending')
            ->where('expired_at', '<', now())
            ->get();

        $count = 0;

        foreach ($expiredPayments as $payment) {
            DB::transaction(function () use ($payment, $roomAvailabilityService, &$count) {
                // 1. Ubah status Payment dan Booking menjadi Expired[cite: 1]
                $payment->update(['payment_status' => 'Expired']);
                $payment->booking->update(['status' => 'Expired']);

                // 2. Kembalikan stok kamar agar bisa dibooking orang lain[cite: 1]
                $roomAvailabilityService->restoreStock($payment->booking);

                // 3. Catat aktivitas[cite: 1]
                ActivityLog::create([
                    'user_id' => $payment->booking->user_id,
                    'activity' => 'Payment Expired',
                    'description' => "Booking {$payment->booking->booking_code} kedaluwarsa secara otomatis oleh sistem.",
                    'ip_address' => '127.0.0.1' // Log dari sistem
                ]);

                $count++;
            });
        }

        $this->info("Berhasil membatalkan {$count} booking yang kedaluwarsa.");
    }
}
