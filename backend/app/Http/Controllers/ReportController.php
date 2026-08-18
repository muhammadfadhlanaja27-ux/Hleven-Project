<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    private function successResponse(array $data): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    public function bookings(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'hotel_id', 'status']);
        return $this->successResponse($this->reportService->getBookingReport($request->user(), $filters));
    }

    public function revenue(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'hotel_id']);
        return $this->successResponse($this->reportService->getRevenueReport($request->user(), $filters));
    }

    public function refunds(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'hotel_id']);
        return $this->successResponse($this->reportService->getRefundReport($request->user(), $filters));
    }

    public function users(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);
        return $this->successResponse($this->reportService->getUserReport($filters));
    }

    public function hotels(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);
        return $this->successResponse($this->reportService->getHotelReport($filters));
    }

    public function partners(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);
        return $this->successResponse($this->reportService->getPartnerReport($filters));
    }

    public function export(Request $request): JsonResponse
    {
        // PERBAIKAN: Tambahkan 'user' ke dalam daftar validasi 'in:'
        $request->validate([
            'type' => 'required|in:booking,revenue,refund,hotel,partner,user',
            'format' => 'required|in:pdf,excel'
        ]);

        $filters = $request->all();
        $result = $this->reportService->exportReport($request->user(), $filters);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'download_url' => $result['download_url']
        ], 200);
    }
}
