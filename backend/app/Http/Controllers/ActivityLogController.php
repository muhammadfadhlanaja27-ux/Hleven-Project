<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Menampilkan daftar log aktivitas.
     *
     * Mengambil log aktivitas pengguna dengan filter opsional:
     * - user_id: filter berdasarkan ID pengguna
     * - activity: filter berdasarkan jenis aktivitas
     * - start_date: filter tanggal mulai (format Y-m-d)
     * - end_date: filter tanggal akhir (format Y-m-d)
     * - page: nomor halaman untuk pagination
     *
     * Log diorder by created_at terbaru dan dipaginasi sesuai per_page.
     * Setiap log mencakup: ID, user name, aktivitas, deskripsi, dan timestamp.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse JSON response berisi daftar log aktivitas dengan metadata pagination
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
                    'created_at' => $log->created_at instanceof \DateTimeInterface
                        ? $log->created_at->format('Y-m-d H:i:s')
                        : ($log->created_at ? (string) $log->created_at : now()->format('Y-m-d H:i:s')),
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
                    'total' => $logs->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    /**
     * Menampilkan detail activity log tertentu.
     *
     * Mendapatkan detail log aktivitas berdasarkan ID lengkap dengan informasi user.
     * Hanya menampilkan log yang memiliki relasi user yang valid.
     *
     * @param int $id ID activity log
     * @return \Illuminate\Http\JsonResponse JSON response berisi detail log aktivitas
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $log = ActivityLog::with('user:id,name')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'System',
                    'activity' => $log->activity,
                    'description' => $log->description,
                    'created_at' => $log->created_at instanceof \DateTimeInterface
                        ? $log->created_at->format('Y-m-d H:i:s')
                        : ($log->created_at ? (string) $log->created_at : now()->format('Y-m-d H:i:s')),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Log aktivitas tidak ditemukan.',
            ], 404);
        }
    }

    /**
 * Menghapus log aktivitas tertentu.
 *
 * Proses penghapusan log aktivitas berdasarkan ID.
 * Hanya boleh dihapus jika log tersebut memiliki user_id yang valid
 * atau adalah log sistem (user_name = 'System').
 *
 * @param int $id ID activity log
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penghapusan
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $log = ActivityLog::with('user')->findOrFail($id);

            // Validasi: cek apakah bisa dihapus (log sistem atau milik user)
            if ($log->user_id !== $request->user()->id && $log->user_name !== 'System') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus log ini.',
                ], 403);
            }

            $log->delete();

            return response()->json([
                'success' => true,
                'message' => 'Log aktivitas berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus log aktivitas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}