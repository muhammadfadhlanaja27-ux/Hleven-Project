<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Console\Command;

class SyncPendingPayments extends Command
{
    protected $signature = 'payment:sync-pending';
    protected $description = 'Sinkronisasi otomatis pembayaran pending dengan Midtrans';

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
                // Skip if not found
            }
        }

        $this->info("Berhasil menyinkronkan {$count} pembayaran.");
        return 0;
    }
}
