<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SuperAdminDashboardService;
use Illuminate\Http\JsonResponse;

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

    public function hotels(): JsonResponse
    {
        return $this->successResponse($this->dashboardService->getHotelStats());
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
}
