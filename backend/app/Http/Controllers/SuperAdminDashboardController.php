<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SuperAdminDashboardService;
use Illuminate\Http\JsonResponse;
use App\Models\Hotel;
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
            'data' => $data
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
            'status' => 'required|string'
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
                'message' => 'Status hotel berhasil diperbarui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status hotel.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
