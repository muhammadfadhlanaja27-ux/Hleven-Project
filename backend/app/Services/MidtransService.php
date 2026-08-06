<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class MidtransService
{
    public function __construct()
    {
        // Set konfigurasi Midtrans
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;
    }

    /**
     * Menghasilkan Snap Token untuk Frontend
     */
    public function generateSnapToken(Payment $payment): string
    {
        // Jika token sudah ada, gunakan yang lama[cite: 1]
        if ($payment->snap_token) {
            return $payment->snap_token;
        }

        $booking = $payment->booking;

        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code, // Sesuai aturan PAYMENT-002[cite: 1]
                'gross_amount' => (int) $payment->gross_amount, // Sesuai aturan PAYMENT-003[cite: 1]
            ],
            'customer_details' => [
                'first_name' => $booking->user->name,
                'email' => $booking->user->email,
            ]
        ];

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        // Simpan token ke database
        $payment->update(['snap_token' => $snapToken]);

        return $snapToken;
    }

    /**
     * Menangani Callback dari Midtrans
     */
    public function handleCallback(array $payload): void
    {
        $orderId = $payload['order_id'];
        $statusCode = $payload['status_code'];
        $grossAmount = $payload['gross_amount'];
        $serverKey = config('midtrans.server_key');

        // 1. Validasi Signature Key[cite: 1]
        $signatureKey = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);
        if ($signatureKey !== $payload['signature_key']) {
            throw new \Exception("Invalid Signature");
        }

        $transactionStatus = $payload['transaction_status'];

        DB::transaction(function () use ($orderId, $transactionStatus) {
            $booking = Booking::where('booking_code', $orderId)->firstOrFail();
            $payment = $booking->payment;

            // 2. Tentukan status baru
            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                $payment->update(['payment_status' => 'Success', 'paid_at' => now()]);
                $booking->update(['status' => 'Paid']); // PAYMENT-007[cite: 1]

                // Panggil QRCodeService untuk membuat E-Ticket yang rapi
                app(\App\Services\QRCodeService::class)->generateTicket($booking);

                $activity = 'Payment Success';
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $status = $transactionStatus === 'expire' ? 'Expired' : 'Cancelled';
                $payment->update(['payment_status' => $status]);
                $booking->update(['status' => $status]); // PAYMENT-008, PAYMENT-009[cite: 1]

                // Kembalikan stok kamar
                app(\App\Services\RoomAvailabilityService::class)->restoreStock($booking);

                $activity = 'Payment ' . $status;
            }

            // 3. Catat Activity Log[cite: 1]
            ActivityLog::create([
                'user_id' => $booking->user_id,
                'activity' => $activity,
                'description' => "Callback Midtrans status {$transactionStatus} untuk Order ID {$orderId}",
                'ip_address' => request()->ip()
            ]);
        });
    }

    /**
     * Sinkronisasi status pembayaran manual dari Midtrans
     */
    public function syncPaymentStatus(Payment $payment): void
    {
        $booking = $payment->booking;

        // Memanggil API Midtrans untuk mendapatkan status terbaru
        $statusResponse = \Midtrans\Transaction::status($booking->booking_code);

        $transactionStatus = $statusResponse->transaction_status;

        DB::transaction(function () use ($payment, $booking, $transactionStatus, $statusResponse) {
            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                if ($payment->payment_status !== 'Success') {
                    $payment->update(['payment_status' => 'Success', 'paid_at' => now()]);
                    $booking->update(['status' => 'Paid']);

                    // Panggil QRCodeService untuk membuat E-Ticket yang rapi
                    app(\App\Services\QRCodeService::class)->generateTicket($booking);

                    $this->logSyncActivity($booking->user_id, 'Payment Success', $booking->booking_code);
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $status = $transactionStatus === 'expire' ? 'Expired' : 'Cancelled';

                if ($payment->payment_status !== $status) {
                    $payment->update(['payment_status' => $status]);
                    $booking->update(['status' => $status]); // Sesuai aturan PAYMENT-008 dan PAYMENT-009[cite: 1]

                    // Kembalikan stok kamar
                    app(\App\Services\RoomAvailabilityService::class)->restoreStock($booking);

                    $this->logSyncActivity($booking->user_id, 'Payment ' . $status, $booking->booking_code);
                }
            }
        });
    }

    private function logSyncActivity($userId, $activity, $orderId)
    {
        ActivityLog::create([
            'user_id' => $userId,
            'activity' => $activity,
            'description' => "Manual Sync Midtrans status untuk Order ID {$orderId}", // Aturan PAYMENT-010[cite: 1]
            'ip_address' => request()->ip()
        ]);
    }
}
