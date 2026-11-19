<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification as FacadeNotification;
use App\Models\Notification;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Menampilkan daftar notifikasi untuk pengguna.
     *
     * Mengambil semua notifikasi berdasarkan filter opsional:
     * - is_read: filter berdasarkan status sudah dibaca/belum dibaca
     * - type: filter berdasarkan tipe notifikasi (system, appeal, payment, dll)
     * - page: nomor halaman untuk pagination
     *
     * Data diorder by created_at terbaru dan dipaginasi sesuai per_page.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse JSON response berisi daftar notifikasi dengan metadata pagination
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
                    'total' => $notifications->total(),
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
     * Menampilkan detail notifikasi tertentu.
     *
     * Mendetailkan isi notifikasi berdasarkan ID. Notifikasi harus milik
     * pengguna yang login (user_id sesuai).
     *
     * @param int $id ID notifikasi
     * @return \Illuminate\Http\JsonResponse JSON response berisi detail notifikasi
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $notification,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }
    }

    /**
     * Menandai notifikasi sebagai telah dibaca.
     *
     * Proses menandai satu notifikasi tertentu sebagai "sudah dibaca" ($is_read = true).
     * Validasi bahwa notifikasi milik pengguna yang login sebelum memperbarui.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id ID notifikasi
     * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penandaan
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
                'message' => 'Notification berhasil ditandai sebagai telah dibaca.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui notifikasi.',
            ], 500);
        }
    }

    /**
     * Menandai seluruh notifikasi milik pengguna sebagai telah dibaca.
     *
     * Proses massal menandai semua notifikasi milik pengguna sebagai "sudah dibaca".
     * Panggil notifikasiService untuk memperbarui status semua notifikasi.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penandaan massal
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $this->notificationService->markAllAsRead($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Seluruh notification berhasil ditandai sebagai telah dibaca.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui notifikasi.',
            ], 500);
        }
    }

    /**
 * Menghapus notifikasi.
 *
 * Proses penghapusan satu notifikasi berdasarkan ID.
 * Validasi bahwa notifikasi milik pengguna yang login sebelum menghapus.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID notifikasi
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penghapusan
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);

            if ($notification->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus notifikasi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}