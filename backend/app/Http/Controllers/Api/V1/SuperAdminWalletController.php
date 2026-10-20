<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HotelWithdrawal;
use App\Models\WalletLedgerEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminWalletController extends Controller
{
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
