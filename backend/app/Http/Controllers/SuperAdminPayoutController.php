<?php

namespace App\Http\Controllers;

use App\Models\Payout;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class SuperAdminPayoutController extends Controller
{
    public function __construct(
        private PayoutService $payoutService,
        private \App\Services\SuperAdminDashboardService $dashboardService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|in:pending,approved,rejected,paid',
            'search' => 'nullable|string|max:100',
            'per_page' => 'nullable|integer|min:1|max:100',
            'breakdown_page' => 'nullable|integer|min:1',
            'page' => 'nullable|integer|min:1',
        ]);

        $rate = (float) config('hleven.commission_rate', 0.05);
        $totalGross = (float) \App\Models\Payment::where('payment_status', 'success')->sum('gross_amount');
        $platformCommission = $totalGross * $rate;
        $hotelNetRevenue = $totalGross - $platformCommission;

        // Ambil rincian pendapatan per hotel dengan paginasi terpisah
        $hotelStats = $this->dashboardService->getHotelCommissionStats(
            null, 
            null, 
            'platform_commission', 
            'desc', 
            10, 
            $request->query('search'),
            'breakdown_page'
        );

        $query = Payout::with([
            'hotel:id,name,admin_id,bank_name,bank_account_number,bank_account_name',
            'requester:id,name,email',
            'approver:id,name',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('hotel', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $payouts = $query->latest()->paginate((int) $request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Data keuangan dan pencairan berhasil dimuat',
            'data' => [
                'summary' => [
                    'total_gross' => $totalGross,
                    'platform_commission' => $platformCommission,
                    'hotel_net_revenue' => $hotelNetRevenue,
                    'commission_rate' => $rate
                ],
                'hotel_breakdown' => [
                    'data' => $hotelStats['hotels'] ?? [],
                    'pagination' => $hotelStats['pagination'] ?? null
                ],
                'payouts' => $payouts
            ]
        ], 200);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,paid',
            'admin_note' => 'nullable|string|max:1000',
            'reference' => 'nullable|string|max:100',
        ]);

        $payout = Payout::find($id);

        if (! $payout) {
            return response()->json(['success' => false, 'message' => 'Data pencairan tidak ditemukan.'], 404);
        }

        try {
            $payout = $this->payoutService->updateStatus(
                $payout,
                $request->user(),
                $request->input('status'),
                $request->input('admin_note'),
                $request->input('reference')
            );
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pencairan berhasil diperbarui.',
            'data' => $payout,
        ], 200);
    }
}
