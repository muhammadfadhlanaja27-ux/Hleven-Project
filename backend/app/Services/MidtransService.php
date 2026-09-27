<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        $this->syncConfig();
    }

    private function syncConfig(): void
    {
        Config::$serverKey = config('midtrans.serverKey') ?? config('midtrans.server_key') ?? env('MIDTRANS_SERVER_KEY');
        Config::$clientKey = config('midtrans.clientKey') ?? config('midtrans.client_key') ?? env('MIDTRANS_CLIENT_KEY');
        $isProd = config('midtrans.isProduction') ?? config('midtrans.is_production') ?? env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isProduction = filter_var($isProd, FILTER_VALIDATE_BOOLEAN);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Menghasilkan Snap Token untuk Frontend
     */
    public function generateSnapToken(Payment $payment): string
    {
        $this->syncConfig();
        if (empty(Config::$serverKey)) {
            throw new \Exception('Midtrans serverKey kosong. Cek config/midtrans.php & .env MIDTRANS_SERVER_KEY');
        }

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
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        // Simpan token ke database
        $payment->update(['snap_token' => $snapToken]);

        return $snapToken;
    }

    /**
     * Menangani Callback dari Midtrans
     */
    public function handleCallback(array $payload): void
    {
        $this->syncConfig();
        $orderId = $payload['order_id'];
        $statusCode = $payload['status_code'];
        $grossAmount = $payload['gross_amount'];
        $serverKey = Config::$serverKey ?? config('midtrans.serverKey') ?? config('midtrans.server_key');

        // 1. Validasi Signature Key[cite: 1]
        $signatureKey = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);
        if ($signatureKey !== $payload['signature_key']) {
            throw new \Exception('Invalid Signature');
        }

        $transactionStatus = $payload['transaction_status'];

        $paymentType = $payload['payment_type'] ?? null;
        $trxId = $payload['transaction_id'] ?? null;
        DB::transaction(function () use ($orderId, $transactionStatus, $paymentType, $trxId) {
            $booking = Booking::where('booking_code', $orderId)->firstOrFail();
            $payment = $booking->payment;

            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                $payment->update([
                    'payment_status' => 'success',
                    'paid_at' => now(),
                    'payment_method' => $paymentType ?? $payment->payment_method,
                    'transaction_id' => $trxId ?? $payment->transaction_id,
                ]);
                $booking->update(['status' => 'paid']);

                app(QRCodeService::class)->generateTicket($booking);

                $activity = 'Payment Success';
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $status = $transactionStatus === 'expire' ? 'expired' : 'cancelled';
                $payment->update([
                    'payment_status' => $status,
                    'payment_method' => $paymentType ?? $payment->payment_method,
                    'transaction_id' => $trxId ?? $payment->transaction_id,
                ]);
                $booking->update(['status' => $status]);

                app(RoomAvailabilityService::class)->restoreStock($booking);

                $activity = 'Payment '.$status;
            }

            // 3. Catat Activity Log[cite: 1]
            ActivityLog::create([
                'user_id' => $booking->user_id,
                'activity' => $activity,
                'description' => "Callback Midtrans status {$transactionStatus} untuk Order ID {$orderId}",
                'ip_address' => request()->ip(),
            ]);
        });
    }

    /**
     * Sinkronisasi status pembayaran manual dari Midtrans
     */
    public function syncPaymentStatus(Payment $payment): void
    {
        $this->syncConfig();
        $booking = $payment->booking;

        // Memanggil API Midtrans untuk mendapatkan status terbaru
        $statusResponse = Transaction::status($booking->booking_code);

        $transactionStatus = $statusResponse->transaction_status;
        $paymentType = $statusResponse->payment_type ?? null;
        $trxId = $statusResponse->transaction_id ?? null;

        DB::transaction(function () use ($payment, $booking, $transactionStatus, $paymentType, $trxId) {
            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                if ($payment->payment_status !== 'success') {
                    $payment->update([
                        'payment_status' => 'success',
                        'paid_at' => now(),
                        'payment_method' => $paymentType ?? $payment->payment_method,
                        'transaction_id' => $trxId ?? $payment->transaction_id,
                    ]);
                    $booking->update(['status' => 'paid']);

                    app(QRCodeService::class)->generateTicket($booking);

                    $this->logSyncActivity($booking->user_id, 'Payment Success', $booking->booking_code);
                } elseif ($paymentType && $payment->payment_method !== $paymentType) {
                    $payment->update(['payment_method' => $paymentType, 'transaction_id' => $trxId ?? $payment->transaction_id]);
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $status = $transactionStatus === 'expire' ? 'expired' : 'cancelled';

                if ($payment->payment_status !== $status) {
                    $payment->update([
                        'payment_status' => $status,
                        'payment_method' => $paymentType ?? $payment->payment_method,
                        'transaction_id' => $trxId ?? $payment->transaction_id,
                    ]);
                    $booking->update(['status' => $status]);

                    app(RoomAvailabilityService::class)->restoreStock($booking);

                    $this->logSyncActivity($booking->user_id, 'Payment '.$status, $booking->booking_code);
                } elseif ($paymentType && $payment->payment_method !== $paymentType) {
                    $payment->update(['payment_method' => $paymentType, 'transaction_id' => $trxId ?? $payment->transaction_id]);
                }
            } elseif ($paymentType && $payment->payment_method !== $paymentType) {
                $payment->update(['payment_method' => $paymentType, 'transaction_id' => $trxId ?? $payment->transaction_id]);
            }
        });
    }

    private function logSyncActivity($userId, $activity, $orderId)
    {
        ActivityLog::create([
            'user_id' => $userId,
            'activity' => $activity,
            'description' => "Manual Sync Midtrans status untuk Order ID {$orderId}", // Aturan PAYMENT-010[cite: 1]
            'ip_address' => request()->ip(),
        ]);
    }
}
