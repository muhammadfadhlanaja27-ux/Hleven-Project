<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'data' => $data,
        ], 200);
    }

    /**
 * Menampilkan laporan booking.
 *
 * Mengambil data laporan booking berdasarkan filter tanggal, hotel, dan status.
 * Filter yang tersedia: start_date, end_date, hotel_id, status.
 * Data diambil melalui ReportService untuk diproses.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan booking
     */
    public function bookings(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'hotel_id', 'status']);

        return $this->successResponse($this->reportService->getBookingReport($request->user(), $filters));
    }

    /**
 * Menampilkan laporan pendapatan.
 *
 * Mengambil data laporan pendapatan berdasarkan filter tanggal dan hotel.
 * Filter yang tersedia: start_date, end_date, hotel_id.
 * Data diambil melalui ReportService untuk diproses.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan pendapatan
     */
    public function revenue(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'hotel_id']);

        return $this->successResponse($this->reportService->getRevenueReport($request->user(), $filters));
    }

    /**
 * Menampilkan laporan refund.
 *
 * Mengambil data laporan refund berdasarkan filter tanggal, hotel, dan status.
 * Filter yang tersedia: start_date, end_date, hotel_id.
 * Data diambil melalui ReportService untuk diproses.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan refund
     */
    public function refunds(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'hotel_id']);

        return $this->successResponse($this->reportService->getRefundReport($request->user(), $filters));
    }

    /**
 * Menampilkan laporan pengguna.
 *
 * Mengambil data laporan pengguna berdasarkan filter tanggal.
 * Filter yang tersedia: start_date, end_date.
 * Data diambil melalui ReportService untuk diproses.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan pengguna
     */
    public function users(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);

        return $this->successResponse($this->reportService->getUserReport($filters));
    }

    /**
 * Menampilkan laporan hotel.
 *
 * Mengambil data laporan hotel berdasarkan filter tanggal.
 * Filter yang tersedia: start_date, end_date.
 * Data diambil melalui ReportService untuk diproses.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan hotel
     */
    public function hotels(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);

        return $this->successResponse($this->reportService->getHotelReport($filters));
    }

    /**
 * Menampilkan laporan partner.
 *
 * Mengambil data laporan partner berdasarkan filter tanggal.
 * Filter yang tersedia: start_date, end_date.
 * Data diambil melalui ReportService untuk diproses.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan partner
     */
    public function partners(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);

        return $this->successResponse($this->reportService->getPartnerReport($filters));
    }

    /**
 * Menampilkan ringkasan keuangan.
 *
 * Mengambil ringkasan keuangan berdasarkan filter tanggal.
 * Filter yang tersedia: start_date, end_date.
 * Mengembalikan total pendapatan, refund, dan komisi.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi ringkasan keuangan
     */
    public function summary(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);
        return $this->successResponse($this->reportService->getFinancialSummary($filters, $request->user()));
    }


    public function export(Request $request): JsonResponse
    {
        // PERBAIKAN: Tambahkan 'user' ke dalam daftar validasi 'in:'
        $request->validate([
            'type' => 'required|in:booking,revenue,refund,hotel,partner,user',
            'format' => 'required|in:pdf,excel',
        ]);

        $filters = $request->all();
        $result = $this->reportService->exportReport($request->user(), $filters);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'download_url' => $result['download_url'],
        ], 200);
    }
}
