<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Services\SuperAdminDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminDashboardController extends Controller
{
    protected SuperAdminDashboardService $dashboardService;

    public function __construct(SuperAdminDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    private function successResponse($data): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil.',
            'data' => $data,
        ], 200);
    }

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getSummary());
    }

    public function bookings(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getBookingStats());
    }

    public function payments(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getPaymentStats());
    }

    public function refunds(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getRefundStats());
    }

    public function revenue(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $year = $request->query('year');

        return $this->successResponse($this->dashboardService->getRevenueStats($month, $year));
    }

    public function hotelCommission(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'sort_by' => 'nullable|in:hotel_revenue,platform_commission,hotel_name,transactions_count',
            'sort_dir' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:100',
        ]);

        $data = $this->dashboardService->getHotelCommissionStats(
            $request->query('start_date'),
            $request->query('end_date'),
            $request->query('sort_by', 'platform_commission'),
            $request->query('sort_dir', 'desc'),
            (int) $request->query('per_page', 10),
            $request->query('search')
        );

        return $this->successResponse($data);
    }

    public function users(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getUserStats());
    }

    public function hotels(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status'); // Tangkap parameter status

        $data = $this->dashboardService->getAllHotelsForMonitoring($search, $status);

        return $this->successResponse($data);
    }

    public function partners(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getPartnerStats());
    }

    public function charts(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getCharts());
    }

    public function recentActivities(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getRecentActivities());
    }

    public function updateHotelStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        try {
            $hotel = Hotel::findOrFail($id);

            // PERBAIKAN: Paksa status menjadi huruf kecil agar lolos dari constraint database Supabase
            $statusToSave = strtolower($request->status);

            // Jika frontend mengirim "Suspended" atau "Active", sesuaikan dengan pilihan database jika diperlukan
            // (misal database pakai 'inactive' atau 'blocked', sesuaikan dengan constraint Anda, umumnya 'active', 'inactive', 'suspended')

            $this->dashboardService->updateHotelStatus($hotel, $statusToSave);

            return response()->json([
                'success' => true,
                'message' => 'Status hotel berhasil diperbarui.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status hotel.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateHotelStar(Request $request, $id): JsonResponse
    {
        $request->validate([
            'star_rating' => 'nullable|integer|min:1|max:5',
            'star_verified_reason' => 'nullable|string|max:1000',
        ]);
        try {
            $hotel = Hotel::findOrFail($id);
            $this->dashboardService->updateHotelStar($hotel, $request->input('star_rating'), $request->input('star_verified_reason'), $request->user());

            return response()->json(['success' => true, 'message' => 'Bintang hotel berhasil diperbarui.'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui bintang hotel.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroyHotel($id): JsonResponse
    {
        try {
            $hotel = Hotel::findOrFail($id);
            $hotel->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hotel berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus hotel.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
