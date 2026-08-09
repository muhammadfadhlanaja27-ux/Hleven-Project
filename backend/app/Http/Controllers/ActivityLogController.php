<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * GET /api/v1/activity-logs
     * Menampilkan daftar aktivitas[cite: 1]
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['user_id', 'activity', 'start_date', 'end_date', 'page']);

            $logs = $this->activityLogService->getLogs($request->user(), $filters);

            // Mapping data agar struktur response sesuai dengan dokumentasi[cite: 1]
            $data = $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'System',
                    'activity' => $log->activity,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s')
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil.',
                'data' => $data,
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);
        }
    }

    /**
     * GET /api/v1/activity-logs/{id}
     * Menampilkan detail activity log[cite: 1]
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $log = ActivityLog::with('user:id,name')->findOrFail($id);
            $user = $request->user();

            // Otorisasi: Cegah Admin Hotel melihat log milik admin/hotel lain[cite: 1]
            if ($user->role === 'admin_hotel' && $log->user_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'System',
                    'activity' => $log->activity,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s')
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Activity tidak ditemukan.'
            ], 404);
        }
    }
}
