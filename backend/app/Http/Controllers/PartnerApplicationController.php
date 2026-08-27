<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PartnerApplication;
use App\Services\PartnerApplicationService;
use Illuminate\Http\JsonResponse;

class PartnerApplicationController extends Controller
{
    protected PartnerApplicationService $partnerService;

    public function __construct(PartnerApplicationService $partnerService)
    {
        $this->partnerService = $partnerService;
    }

    /**
     * GET /api/v1/user/partner-application
     * Mengambil data pengajuan milik user yang sedang login
     */
    public function getUserApplication(Request $request): JsonResponse
    {
        $application = PartnerApplication::where('user_id', $request->user()->id)->first();

        return response()->json([
            'success' => true,
            'data' => $application // Mengembalikan data atau null jika belum mendaftar (HTTP 200 OK)
        ], 200);
    }

    public function index(Request $request): JsonResponse
    {
        $applications = PartnerApplication::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $applications
        ], 200);
    }

    /**
     * PATCH /api/v1/partner-applications/{id}/approve
     */
    public function approve(Request $request, $id): JsonResponse
    {
        try {
            $application = PartnerApplication::findOrFail($id);
            $this->partnerService->approveApplication($application, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Partner berhasil disetujui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui partner.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PATCH /api/v1/partner-applications/{id}/reject
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);

        try {
            $application = PartnerApplication::findOrFail($id);
            $this->partnerService->rejectApplication($application, $request->user(), $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan partner ditolak.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak partner.'
            ], 500);
        }
    }
}