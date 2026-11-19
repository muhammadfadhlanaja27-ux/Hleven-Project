<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HotelWithdrawal;
use App\Models\WalletLedgerEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminWalletController extends Controller
{
    /**
 * Ringkasan wallet super-admin.
 *
 * Menampilkan total commission dan daftar penarikan hotel yang dikelola
 * oleh super-admin. Data diambil dari WalletLedgerEntry bertipe 'platform'
 * serta HotelWithdrawal records.
 *
 * Ringkasan mencakup:
 * - commission_total: total amount seluruh ledger platform
 * - commission_held: amount yang dijagalkan (held bucket)
 * - commission_available: amount yang dapat ditarik
 * - withdrawals: daftar penarikan hotel dengan pagination
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi ringkasan wallet platform
     */
    public function index(Request $request): JsonResponse
    {
        $commission = WalletLedgerEntry::query()
            ->where('account_type', 'platform')
            ->sum('amount');

        $held = WalletLedgerEntry::query()
            ->where('account_type', 'platform')
            ->where('bucket', 'held')
            ->sum('amount');

        $available = WalletLedgerEntry::query()
            ->where('account_type', 'platform')
            ->where('bucket', 'available')
            ->sum('amount');

        $withdrawals = HotelWithdrawal::query()
            ->with('hotel:id,name')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => [
                'commission_total' => (int) $commission,
                'commission_held' => (int) $held,
                'commission_available' => (int) $available,
                'withdrawals' => $withdrawals,
            ],
        ]);
    }
}
