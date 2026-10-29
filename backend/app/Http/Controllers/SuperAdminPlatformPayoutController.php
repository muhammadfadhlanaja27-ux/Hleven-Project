<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PlatformPayout;
use App\Models\PlatformPayoutSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuperAdminPlatformPayoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $rate = (float) config('hleven.commission_rate', 0.05);
        $totalPlatformCommission = (float) Payment::where('payment_status', 'success')
            ->sum(DB::raw("gross_amount * {$rate}"));

        $paidCommission = (float) PlatformPayout::where('status', 'paid')->sum('amount');
        $availableCommission = max(0, $totalPlatformCommission - $paidCommission);

        $payouts = PlatformPayout::with('confirmer:id,name')->latest()->paginate(10);
        $settings = PlatformPayoutSetting::firstOrCreate([], ['payout_day' => 1, 'is_active' => false]);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_commission' => $totalPlatformCommission,
                    'paid_commission' => $paidCommission,
                    'available_commission' => $availableCommission,
                ],
                'payouts' => $payouts,
                'settings' => $settings,
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'admin_note' => 'nullable|string|max:500',
            'reference' => 'nullable|string|max:100',
        ]);

        $rate = (float) config('hleven.commission_rate', 0.05);
        $totalPlatformCommission = (float) Payment::where('payment_status', 'success')
            ->sum(DB::raw("gross_amount * {$rate}"));
        $paidCommission = (float) PlatformPayout::where('status', 'paid')->sum('amount');
        $availableCommission = max(0, $totalPlatformCommission - $paidCommission);

        if ($request->amount > $availableCommission) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah penarikan melebihi saldo komisi yang tersedia.'
            ], 422);
        }

        $payout = PlatformPayout::create([
            'amount' => $request->amount,
            'status' => 'paid', // Karena konfirmasi manual transfer bank
            'reference' => $request->reference,
            'admin_note' => $request->admin_note,
            'confirmed_by' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pencairan komisi berhasil dicatat.',
            'data' => $payout,
        ], 201);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'payout_day' => 'required|integer|min:1|max:28',
            'is_active' => 'required|boolean',
            'target_email' => 'nullable|email',
        ]);

        $settings = PlatformPayoutSetting::first();
        $settings->update($request->only(['payout_day', 'is_active', 'target_email']));

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan pencairan komisi berhasil diperbarui.',
            'data' => $settings,
        ]);
    }
}
