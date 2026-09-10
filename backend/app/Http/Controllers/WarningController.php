<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Warning;
use App\Models\Hotel;
use App\Services\WarningService;
use Illuminate\Http\JsonResponse;

class WarningController extends Controller
{
    protected WarningService $warningService;

    public function __construct(WarningService $warningService)
    {
        $this->warningService = $warningService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['hotel_id', 'status', 'page']);
            $warnings = $this->warningService->getWarnings($request->user(), $filters);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil.',
                'data' => $warnings->items(),
                'meta' => [
                    'current_page' => $warnings->currentPage(),
                    'last_page' => $warnings->lastPage(),
                    'per_page' => $warnings->perPage(),
                    'total' => $warnings->total()
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    public function show(Request $request, $id): JsonResponse
    {
        try {
            $warning = Warning::with('hotel')->findOrFail($id);
            $user = $request->user();

            // Admin Hotel hanya bisa melihat warning milik hotelnya[cite: 1]
            if ($user->role === 'admin_hotel') {
                $isOwner = Hotel::where('id', $warning->hotel_id)
                                ->where('admin_id', $user->id)
                                ->exists();
                if (!$isOwner) {
                    return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $warning
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'title' => 'required|string|max:100',
            'message' => 'required|string|max:1000',
        ]);

        try {
            $this->warningService->createWarning($validated, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Warning berhasil dibuat.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat warning.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,resolved' // Menggunakan pending / resolved sesuai Endpoint Summary[cite: 1]
        ]);

        try {
            $warning = Warning::findOrFail($id);
            $this->warningService->updateStatus($warning, $request->status, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Status warning berhasil diperbarui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status warning.'
            ], 500);
        }
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $warning = Warning::findOrFail($id);
            $this->warningService->deleteWarning($warning, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Warning berhasil dihapus.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus warning.'
            ], 500);
        }
    }
}
