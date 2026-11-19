<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Console\Command;

class SyncPendingPayments extends Command
{
    protected $signature = 'payment:sync-pending';
    protected $description = 'Sinkronisasi otomatis pembayaran pending dengan Midtrans';

    /**
     * Execute the console command.
     *
     * Sinkronisasi status pembayaran pending ke Midtrans untuk pembayaran
     * yang status 'pending' dan dibuat dalam 24 jam terakhir.
     *
     * Logika:
     * 1. Ambil daftar pembayaran status 'pending' dari 24 jam terakhir
     * 2. Panggil MidtransService->syncPaymentStatus() untuk setiap pembayaran
     * 3. Jika sukses, increment counter $count
     * 4. Jika gagal (exception), skip (abaikan) - payment mungkin sudah selesai atau tidak ditemukan di Midtrans
     * 5. Laporkan jumlah berhasil disinkronkan via $this->info
     *
     * Dependencies:
     * - MidtransService: service layer untuk komunikasi API Midtrans
     *   di-inject dari Laravel Service Container
     *
     * @param MidtransService $midtransService - Di-inject dari container Laravel
     * @return int - Jumlah pembayaran berhasil disinkronkan
     */
    public function handle(MidtransService $midtransService)
    {
        $payments = Payment::where('payment_status', 'pending')
            ->where('created_at', '>=', now()->subHours(24))
            ->get();

        $count = 0;
        foreach ($payments as $payment) {
            try {
                $midtransService->syncPaymentStatus($payment);
                $count++;
            } catch (\Exception $e) {
                // Skip if not found - payment mungkin sudah selesai atau tidak ada di Midtrans
            }
        }

        $this->info("Berhasil menyinkronkan {$count} pembayaran.");

        return 0;
    }
}
