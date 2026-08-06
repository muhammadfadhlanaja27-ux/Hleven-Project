<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    protected MidtransService $midtransService;

    /**
     * GET /api/v1/payments/{id}
     * Menampilkan detail pembayaran berdasarkan booking
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $payment = Payment::with('booking')->findOrFail($id);

            // Otorisasi: Pastikan user yang login adalah pemilik booking
            if ($payment->booking->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden.'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_method' => $payment->payment_method,
                    'payment_status' => $payment->payment_status,
                    'gross_amount' => $payment->gross_amount,
                    'expired_at' => $payment->expired_at,
                    'transaction_id' => $payment->transaction_id,
                    'order_id' => $payment->order_id,
                    'paid_at' => $payment->paid_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * POST /api/v1/payments/{id}/snap-token
     * Menghasilkan Snap Token untuk Frontend
     */
    public function generateSnapToken(Request $request, $id): JsonResponse
    {
        try {
            $payment = Payment::with('booking.user')->findOrFail($id);

            // Otorisasi: Pastikan user yang login adalah pemilik booking
            if ($payment->booking->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden.'
                ], 403);
            }

            $snapToken = $this->midtransService->generateSnapToken($payment);

            return response()->json([
                'success' => true,
                'data' => [
                    'snap_token' => $snapToken
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/payments/callback
     * Webhook/Callback dari Midtrans Server
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            // Melempar payload request langsung ke Service
            $this->midtransService->handleCallback($request->all());

            return response()->json([
                'status' => 'success'
            ], 200);

        } catch (\Exception $e) {
            // Midtrans membutuhkan HTTP 200 atau 400 untuk callback
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * GET /api/v1/payments/{id}/status
     * Mengambil status pembayaran terbaru
     */
    public function status(Request $request, $id): JsonResponse
    {
        $payment = Payment::with('booking')->findOrFail($id);

        if ($payment->booking->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'payment_status' => $payment->payment_status,
                'booking_status' => $payment->booking->status
            ]
        ], 200);
    }
    /**
     * POST /api/v1/payments/{id}/sync
     * Manual Sync oleh Super Admin[cite: 1]
     */
    public function sync(Request $request, $id): JsonResponse
    {
        try {
            // Pastikan route ini dilindungi middleware role:super_admin[cite: 1]
            $payment = Payment::with('booking')->findOrFail($id);

            $this->midtransService->syncPaymentStatus($payment);

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil disinkronkan.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyinkronkan data dengan Midtrans.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
