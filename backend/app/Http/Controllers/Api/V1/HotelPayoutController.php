<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Services\PayoutService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

class HotelPayoutController extends Controller
{
    public function __construct(private PayoutService $payoutService) {}

    private function resolveHotel(Request $request)
    {
        $user = $request->user();

        return $user->hotel ?? $user->hotels()->first();
    }

    /**
 * Daftar pencairan hotel.
 *
 * Menampilkan seluruh riwayat permintaan pencairan untuk hotel tertentu.
 * Query didukung filtering status dan pengurutan berdasarkan tanggal.
 * Response mencakup balance hotel, data bank, dan konfigurasi limit
 * pencairan dari konfigurasi aplikasi.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi riwayat pencairan lengkap
     */
    public function index(Request $request): JsonResponse
    {
        $hotel = $this->resolveHotel($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $payouts = Payout::with('approver:id,name')
            ->where('hotel_id', $hotel->id)
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data pencairan berhasil dimuat',
            'data' => [
                'balance' => $this->payoutService->getBalance($hotel),
                'bank' => [
                    'bank_name' => $hotel->bank_name,
                    'bank_account_number' => $hotel->bank_account_number,
                    'bank_account_name' => $hotel->bank_account_name,
                ],
                'payouts' => $payouts,
                'destinations' => $hotel->payoutDestinations()
                    ->where('status', 'active')
                    ->latest()
                    ->get(),
                'limits' => [
                    'min_payout' => (float) config('hleven.min_payout', 0),
                    'commission_rate' => (float) config('hleven.commission_rate', 0.05),
                    'auto_approve' => (bool) config('hleven.auto_approve_payout', false),
                    'auto_approve_daily_limit' => (float) config('hleven.auto_approve_daily_limit', 0),
                ],
            ],
        ], 200);
    }

    /***
 * Mengajukan permintaan pencairan.
 *
 * Proses request payout ke layanan payout (PayoutService).
 * Validasi input mencakup amount (minimal min_payout dari config),
 * note opsional, dan destination_id yang harus aktif terkait hotel.
 *
 * Alur kerja:
 * 1. Validasi input: amount (numeric min min_payout), note (string max 1000),
 *    destination_id (integer, exists di hotel_payout_destinations)
 * 2. Cek destinasi yang dipilih atau gunakan default
 * 3. Panggil PayoutService::requestPayout untuk membuat permintaan
 * 4. Jika sukses: return data payout yang baru dibuat (201)
 * 5. Jika gagal (RuntimeException): return pesan error dan 422
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi status dan data payout
     */
    public function store(Request $request): JsonResponse
    {
        $hotel = $this->resolveHotel($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:' . (config('hleven.min_payout', 0))],
            'note' => 'nullable|string|max:1000',
            'destination_id' => [
                'nullable',
                'integer',
                Rule::exists('hotel_payout_destinations', 'id')
                    ->where('hotel_id', $hotel->id)
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
        ]);

        $destination = $request->filled('destination_id')
            ? $hotel->payoutDestinations()->where('status', 'active')->find($data['destination_id'])
            : null;

        try {
            $payout = $this->payoutService->requestPayout(
                $hotel,
                $request->user(),
                (float) $data['amount'],
                $data['note'] ?? null,
                $destination
            );
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan pencairan berhasil dikirim.',
            'data' => $payout,
        ], 201);
    }

    public function invoice(Request $request, $id)
    {
        $hotel = $this->resolveHotel($request);

        $payout = Payout::where('hotel_id', $hotel?->id)->find($id);

        if (! $payout) {
            return response()->json(['success' => false, 'message' => 'Data pencairan tidak ditemukan.'], 404);
        }

        $balance = $this->payoutService->getBalance($hotel);
        $commissionRate = (float) config('hleven.commission_rate', 0.05);

        $pdf = Pdf::loadView('pdf.hotel-invoice', compact('payout', 'hotel', 'balance', 'commissionRate'));

        return $pdf->download("Invoice-Pencairan-{$payout->id}.pdf");
    }
}
