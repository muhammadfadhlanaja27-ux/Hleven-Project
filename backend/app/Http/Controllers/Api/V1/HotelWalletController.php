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
    /**
 * Ringkasan saldo wallet hotel.
 *
 * Menghitung dan menampilkan total balance yang tersedia dari ledger
 * entries bertipe 'hotel'. Balance dibagi menjadi kategori:
 * - available_balance: saldo yang dapat ditarik
 * - held_balance: saldo yang dijagalkan (dihold)
 *
 * Fitur tambahan dalam response:
 * - withdrawal_blocked_by_debt: mengecek apakah available < 0
 * - minimum_withdrawal: batas minimal penarikan (50.000)
 * - withdrawals_enabled & withdrawals_message: status fitur penarikan
 *   (non-aktif hingga onboarding XenPlatform selesai)
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi ringkasan balance wallet
     */
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

    /**
 * Daftar destinasi pencairan hotel.
 *
 * Menampilkan daftar semua destinasi pembayaran (bank account / e-wallet)
 * yang telah dikonfigurasi untuk hotel tertentu.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi array destinasi pencairan
     */
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

    /**
 * Menambah destinasi pencairan baru.
 *
 * Proses konfigurasi destinasi pencairan (bank account atau e-wallet)
 * untuk hotel. Validasi meliputi tipe destinasi, kode channel,
 * nomor rekening, dan nama pemilik account.
 *
 * Validasi input:
 * - type: required, harus 'bank' atau 'e_wallet'
 * - channel_code: required, string max 80, hanya huruf/angka/_
 * - account_number: required, string min 5 max 34, hanya angka
 * - account_name: required, string max 255
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi data destinasi yang baru dibuat
     */
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

    /**
 * Mengubah destinasi pencairan.
 *
 * Proses update destinasi pencairan yang sudah ada. Semua field
 * wajib diisi kembali (type, channel_code, account_number, account_name).
 * Field provider_recipient_id di-set ke null saat update.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID destinasi pencairan
 * @return \Illuminate\Http\JsonResponse JSON response berisi data destinasi yang sudah diupdate
     */
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

    /**
 * Menghapus destinasi pencairan.
 *
 * Proses penghapusan destinasi pencairan dengan validasi dependent:
 * mengecek apakah destinasi masih digunakan oleh penarikan
 * yang memiliki status 'requested' atau 'processing'.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID destinasi pencairan
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses/gagal penghapusan
     */
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

    /**
 * Daftar penarikan hotel.
 *
 * Menampilkan daftar semua permintaan penarikan yang diajukan hotel.
 * Data diorder by tanggal terbaru dan dipaginasi 15 per halaman.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi daftar penarikan dengan pagination
     */
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

    /***
 * Permintaan penarikan wallet.
 *
 * Mengembalikan respons bahwa fitur penarikan otomatis belum tersedia.
 * Penarikan hanya dapat diaktifkan setelah:
 * 1. Aktivasi XenPlatform
 * 2. Onboarding tiap hotel secara lengkap
 * 3. Konfigurasi payout selesai
 *
 * Response HTTP 503 (Service Unavailable) untuk menandai bahwa
 * fitur ini sementara tidak aktif.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response dengan pesan informasi dan status 503
     */
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
