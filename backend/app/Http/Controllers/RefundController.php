<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Refund;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;

class RefundController extends Controller
{
    protected RefundService $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * PATCH /api/v1/refunds/{id}/approve
     * Menyetujui pengajuan refund
     */
    public function approve(Request $request, $id): JsonResponse
    {
        try {
            $refund = Refund::with('booking')->findOrFail($id);
            $this->refundService->approveRefund($refund, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil disetujui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui refund.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PATCH /api/v1/refunds/{id}/reject
     * Menolak pengajuan refund
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);

        try {
            $refund = Refund::with('booking')->findOrFail($id);
            $this->refundService->rejectRefund($refund, $request->user(), $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil ditolak.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak refund.'
            ], 500);
        }
    }
}
