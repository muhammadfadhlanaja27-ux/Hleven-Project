<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

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
                    'message' => 'Forbidden.',
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
                    'paid_at' => $payment->paid_at,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.',
                'error' => $e->getMessage(),
            ], 404);
        }
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
                    'message' => 'Forbidden.',
                ], 403);
            }

            $snapToken = $this->midtransService->generateSnapToken($payment);

            return response()->json([
                'success' => true,
                'data' => [
                    'snap_token' => $snapToken,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'error' => $e->getMessage(),
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
                'status' => 'success',
            ], 200);

        } catch (\Exception $e) {
            // Midtrans membutuhkan HTTP 200 atau 400 untuk callback
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * GET /api/v1/payments/{id}/status
     * Mengambil status pembayaran terbaru
     */
    public function status(Request $request, $id): JsonResponse
    {
        try {
            $payment = Payment::with('booking')->findOrFail($id);

            if ($payment->booking->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_status' => $payment->payment_status,
                    'booking_status' => $payment->booking->status,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * POST /api/v1/payments/{id}/sync
     * Manual Sync oleh Super Admin
     */
    public function sync(Request $request, $id): JsonResponse
    {
        try {
            $payment = Payment::with('booking')->findOrFail($id);

            $this->midtransService->syncPaymentStatus($payment);

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil disinkronkan.',
            ], 200);

        } catch (\Exception $e) {
            $msg = $e->getMessage();
            $code = (int) ($e->getCode() ?: 0);
            $isNotFound = $code === 404 || str_contains($msg, "doesn't exist") || str_contains($msg, '404') || str_contains($msg, 'not found');
            return response()->json([
                'success' => false,
                'message' => $isNotFound ? $msg : 'Gagal menyinkronkan data dengan Midtrans.',
                'error' => $msg,
            ], $isNotFound ? 404 : 500);
        }
    }

    /**
     * POST /api/v1/payments/{id}/mark-paid
     * Konfirmasi pembayaran manual (QRIS statis / transfer manual)
     * Tanpa gateway: user klik "Saya Sudah Bayar" → backend langsung set status.
     */
    public function markPaid(Request $request, $id): JsonResponse
    {
        try {
            $payment = Payment::with('booking')->findOrFail($id);

            // Otorisasi: Pastikan user yang login adalah pemilik booking
            if ($payment->booking->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden.',
                ], 403);
            }

            // Cegah double-confirmation
            if ($payment->payment_status === 'success') {
                return response()->json([
                    'success' => true,
                    'message' => 'Pembayaran sudah dikonfirmasi.',
                    'data' => [
                        'payment_status' => $payment->payment_status,
                        'booking_status' => $payment->booking->status,
                    ],
                ], 200);
            }

            // Set payment & booking ke paid
            $payment->update([
                'payment_status' => 'success',
                'paid_at' => now(),
                'payment_method' => $request->input('payment_method', $payment->payment_method),
            ]);

            $payment->booking->update(['status' => 'paid']);

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil dikonfirmasi.',
                'data' => [
                    'payment_status' => $payment->payment_status,
                    'booking_status' => $payment->booking->status,
                    'paid_at' => $payment->paid_at->toISOString(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengonfirmasi pembayaran.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/v1/hotel/payments
     * Menampilkan riwayat transaksi (pembayaran) khusus untuk Admin Hotel
     */
    public function hotelPayments(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $hotelId = $user->hotel->id ?? null;

            if (!$hotelId) {
                // Ambil hotel pertama jika admin_id tidak terikat via hasOne (fallback)
                $hotelId = \App\Models\Hotel::where('admin_id', $user->id)->value('id');
            }

            if (!$hotelId) {
                return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
            }

            $query = Payment::whereHas('booking', function ($q) use ($hotelId) {
                $q->where('hotel_id', $hotelId);
            })->with(['booking.user', 'booking.guests']);

            if ($request->filled('search')) {
                $like = '%' . $request->search . '%';
                $query->where(function ($q) use ($like) {
                    $q->where('order_id', 'like', $like)
                        ->orWhere('transaction_id', 'like', $like)
                        ->orWhereHas('booking', function ($qb) use ($like) {
                            $qb->where('booking_code', 'like', $like)
                                ->orWhereHas('guests', function ($qg) use ($like) {
                                    $qg->where('name', 'like', $like)->orWhere('phone', 'like', $like);
                                })
                                ->orWhereHas('user', function ($qu) use ($like) {
                                    $qu->where('name', 'like', $like)->orWhere('email', 'like', $like);
                                });
                        });
                });
            }

            // Filter Status
            if ($request->filled('status')) {
                $query->where('payment_status', $request->status);
            }

            // Filter Date Range
            if ($request->filled('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            $payments = $query->latest()->paginate($request->input('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'pagination' => [
                    'total' => $payments->total(),
                    'per_page' => $payments->perPage(),
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat riwayat transaksi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/v1/hotel/payments/{orderId}/check-status
     * Sinkronisasi status pembayaran manual dengan Midtrans untuk Admin Hotel
     */
    public function syncStatus(Request $request, $orderId): JsonResponse
    {
        try {
            $user = $request->user();
            $hotelId = $user->hotel->id ?? \App\Models\Hotel::where('admin_id', $user->id)->value('id');

            $payment = Payment::where('order_id', $orderId)
                ->whereHas('booking', function ($q) use ($hotelId) {
                    $q->where('hotel_id', $hotelId);
                })
                ->firstOrFail();

            try {
                $this->midtransService->syncPaymentStatus($payment);
            } catch (\Exception $e) {
                $msg = $e->getMessage();
                $code = (int) ($e->getCode() ?: 0);
                $isNotFound = $code === 404 || str_contains($msg, "doesn't exist") || str_contains($msg, '404') || str_contains($msg, 'not found');
                if ($isNotFound) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Transaksi belum ada di Midtrans — order belum generate Snap / pembayaran manual, status lokal tetap pending.',
                        'not_midtrans' => true,
                        'data' => $payment->fresh(),
                    ], 200);
                }
                throw $e;
            }

            return response()->json([
                'success' => true,
                'message' => 'Status pembayaran berhasil diperbarui.',
                'data' => $payment->fresh(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyinkronkan status pembayaran.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
