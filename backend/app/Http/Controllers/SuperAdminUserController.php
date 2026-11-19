<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SuperAdminUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminUserController extends Controller
{
    protected SuperAdminUserService $userService;

    public function __construct(SuperAdminUserService $userService)
    {
        $this->userService = $userService;
    }

    /**
 * Menampilkan daftar pengguna untuk super admin.
 *
 * Menampilkan seluruh data pengguna dengan filter opsional:
 * - role: admin_hotel, user, super_admin
 * - status: active, blocked, inactive
 * - search: mencocokkan nama, email, atau nomor telepon
 *
 * Data diorder by latest dan dipaginasi sesuai per_page.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi daftar pengguna dengan metadata pagination
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Melempar semua parameter filter dari React ke Service
            $filters = $request->only(['role', 'status', 'search', 'per_page']);
            $users = $this->userService->getUsers($filters);

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diambil.',
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
 * Menampilkan detail pengguna tertentu.
 *
 * Mengambil data pengguna berdasarkan ID beserta informasi akun.
 *
 * @param int $id ID pengguna
 * @return \Illuminate\Http\JsonResponse JSON response berisi data pengguna
     */
    public function show($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }
    }

    /**
 * Menambah pengguna baru oleh super admin.
 *
 * Proses pendaftaran pengguna baru dengan validasi komprehensif:
 * - name: wajib, string, max 255 karakter
 * - email: wajib format email, unik di tabel users
 * - password: wajib, minimal 8 karakter
 * - role: wajib, salah satu: admin_hotel, user, super_admin
 * - phone: opsional, string, max 20 karakter
 * - status: opsional, salah satu: active, blocked, inactive
 * - hotel_name: opsional, nama hotel untuk admin_hotel
 *
 * Validasi pastikan role yang dikirim valid dan email belum terdaftar.
 * Pengguran dibuat melalui SuperAdminUserService untuk menjalankan
 * logika bisnis tambahan (jika ada).
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses dan status creation
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin_hotel,user,super_admin',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,blocked,inactive',
            'hotel_name' => 'nullable|string|max:255',
        ]);

        try {
            $this->userService->createUser($validated, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil ditambahkan.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pengguna.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
 * Memperbarui status pengguna oleh super admin.
 *
 * Proses mengubah status akun pengguna (active, blocked, inactive).
 * Validasi memastikan status yang dikirim valid dan tidak boleh
 * mengubah status akun sendiri sendiri super admin.
 *
 * Catatan penting: Semua huruf status diubah menjadi lowercase
 * sebelum disimpan ke database untuk kompatibilitas Supabase.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID pengguna
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses pembaruan status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        // 1. Terima data dari React (apapun bentuk hurufnya)
        $request->validate([
            'status' => 'required|in:Active,Blocked,Inactive,active,blocked,inactive',
        ]);

        try {
            $user = User::findOrFail($id);

            if ($user->id === $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengubah status akun Anda sendiri.',
                ], 400);
            }

            // 2. PERBAIKAN: Paksa menjadi huruf kecil semua agar lolos dari aturan database Supabase
            $statusToSave = strtolower($request->status);

            $this->userService->updateUserStatus($user, $statusToSave, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Status pengguna berhasil diperbarui.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status pengguna.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
 * Memperbarui role pengguna oleh super admin.
 *
 * Proses mengubah role akun pengguna (admin_hotel, user).
 * Hanya boleh diubah jika user bukan dirinya sendiri super admin.
 *
 * Role yang didukung:
 * - admin_hotel: role untuk managemen hotel tertentu
 * - user: role untuk pengguna standar
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID pengguna
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses pembaruan role
     */
    /**
 * Memperbarui role pengguna oleh super admin.
 *
 * Proses mengubah role akun pengguna dari admin_hotel menjadi user atau sebaliknya.
 * Hanya boleh diubah jika user bukan dirinya sendiri super admin.
 *
 * Role yang didukung:
 * - admin_hotel: role untuk managemen hotel tertentu beserta semua kamar & pembayaran
 * - user: role untuk pengguna standar dengan akses terbatas
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID pengguna
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses pembaruan role
     */
    public function updateRole(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:admin_hotel,user',
        ]);

        try {
            $user = User::findOrFail($id);

            if ($user->id === $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengubah role akun Anda sendiri.',
                ], 400);
            }

            $this->userService->updateUserRole($user, $validated['role'], $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil diperbarui.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui role pengguna.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
 * Menghapus pengguna oleh super admin.
 *
 * Proses penghapusan pengguna dari sistem.
 * Hanya boleh dihapus jika user bukan dirinya sendiri super admin.
 *
 * Pencegahan diri sendiri: Super admin tidak dapat menghapus akun itself.
 * Jika mencoba, response akan mengembalikan pesan error dengan status 400.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID pengguna
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penghapusan
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Mencegah Super Admin menghapus dirinya sendiri
            if ($user->id === $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus akun Anda sendiri.',
                ], 400);
            }

            $this->userService->deleteUser($user, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengguna. Pengguna mungkin masih memiliki data terkait.',
            ], 500);
        }
    }
}
