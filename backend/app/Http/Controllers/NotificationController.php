<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * GET /api/v1/notifications
     * Menampilkan daftar notifikasi milik pengguna yang sedang login[cite: 1]
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['is_read', 'type', 'page']);
            $notifications = $this->notificationService->getNotifications($request->user(), $filters);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil.',
                'data' => $notifications->items(),
                'meta' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total()
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
     * GET /api/v1/notifications/{id}
     * Menampilkan detail notifikasi[cite: 1]
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);

            // Validasi kepemilikan notifikasi (NOTIFICATION-004)[cite: 1]
            if ($notification->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $notification
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notification tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * PATCH /api/v1/notifications/{id}/read
     * Menandai satu notifikasi sebagai telah dibaca[cite: 1]
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);

            if ($notification->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            $this->notificationService->markAsRead($notification);

            return response()->json([
                'success' => true,
                'message' => 'Notification berhasil ditandai sebagai telah dibaca.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui notifikasi.'
            ], 500);
        }
    }

    /**
     * PATCH /api/v1/notifications/read-all
     * Menandai seluruh notifikasi milik pengguna sebagai telah dibaca[cite: 1]
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $this->notificationService->markAllAsRead($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Seluruh notification berhasil ditandai sebagai telah dibaca.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui notifikasi.'
            ], 500);
        }
    }

    /**
     * DELETE /api/v1/notifications/{id}
     * Menghapus notifikasi[cite: 1]
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);

            if ($notification->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            $this->notificationService->deleteNotification($notification);

            return response()->json([
                'success' => true,
                'message' => 'Notification berhasil dihapus.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus notifikasi.'
            ], 500);
        }
    }
}
