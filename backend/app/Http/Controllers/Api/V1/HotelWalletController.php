<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\WalletLedgerEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HotelWalletController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $hotel = $this->hotelFor($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        $balances = WalletLedgerEntry::query()
            ->where('account_type', 'hotel')
            ->where('hotel_id', $hotel->id)
            ->selectRaw('bucket, SUM(amount) as balance')
            ->groupBy('bucket')
            ->pluck('balance', 'bucket');

        $available = (int) ($balances['available'] ?? 0);

        return response()->json([
            'success' => true,
            'data' => [
                'held_balance' => (int) ($balances['held'] ?? 0),
                'available_balance' => $available,
                'withdrawal_blocked_by_debt' => $available < 0,
                'minimum_withdrawal' => 50000,
                'withdrawals_enabled' => false,
                'withdrawals_message' => 'Penarikan otomatis belum dapat diaktifkan sebelum onboarding XenPlatform dan konfigurasi payout diselesaikan.',
            ],
        ]);
    }

    public function destinations(Request $request): JsonResponse
    {
        $hotel = $this->hotelFor($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $hotel->payoutDestinations()->latest()->get(),
        ]);
    }

    public function storeDestination(Request $request): JsonResponse
    {
        $hotel = $this->hotelFor($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['bank', 'e_wallet'])],
            'channel_code' => ['required', 'string', 'max:80', 'regex:/^[A-Z0-9_]+$/'],
            'account_number' => ['required', 'string', 'min:5', 'max:34', 'regex:/^[0-9]+$/'],
            'account_name' => ['required', 'string', 'max:255'],
        ]);

        $destination = $hotel->payoutDestinations()->create([
            ...$validated,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tujuan pencairan berhasil disimpan.',
            'data' => $destination,
        ], 201);
    }

    public function updateDestination(Request $request, int $id): JsonResponse
    {
        $hotel = $this->hotelFor($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        $destination = $hotel->payoutDestinations()->find($id);
        if (! $destination) {
            return response()->json(['success' => false, 'message' => 'Tujuan pencairan tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['bank', 'e_wallet'])],
            'channel_code' => ['required', 'string', 'max:80', 'regex:/^[A-Z0-9_]+$/'],
            'account_number' => ['required', 'string', 'min:5', 'max:34', 'regex:/^[0-9]+$/'],
            'account_name' => ['required', 'string', 'max:255'],
        ]);

        $destination->update([
            ...$validated,
            'provider_recipient_id' => null,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tujuan pencairan berhasil diperbarui.',
            'data' => $destination->fresh(),
        ]);
    }

    public function deleteDestination(Request $request, int $id): JsonResponse
    {
        $hotel = $this->hotelFor($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        $destination = $hotel->payoutDestinations()->find($id);
        if (! $destination) {
            return response()->json(['success' => false, 'message' => 'Tujuan pencairan tidak ditemukan.'], 404);
        }

        if ($destination->withdrawals()->whereIn('status', ['requested', 'processing'])->exists()) {
            return response()->json(['success' => false, 'message' => 'Tujuan masih digunakan oleh penarikan yang sedang diproses.'], 409);
        }

        $destination->delete();

        return response()->json(['success' => true, 'message' => 'Tujuan pencairan dihapus.']);
    }

    public function withdrawals(Request $request): JsonResponse
    {
        $hotel = $this->hotelFor($request);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $hotel->withdrawals()->latest()->paginate(15),
        ]);
    }

    public function requestWithdrawal(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Penarikan otomatis belum tersedia. Aktivasi XenPlatform, onboarding tiap hotel, dan konfigurasi payout harus selesai terlebih dahulu.',
        ], 503);
    }

    private function hotelFor(Request $request): ?Hotel
    {
        return $request->user()->hotels()->first();
    }
}
