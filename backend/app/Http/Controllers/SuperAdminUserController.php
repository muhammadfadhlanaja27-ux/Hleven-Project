<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\SuperAdminUserService;
use Illuminate\Http\JsonResponse;

class SuperAdminUserController extends Controller
{
    protected SuperAdminUserService $userService;

    public function __construct(SuperAdminUserService $userService)
    {
        $this->userService = $userService;
    }

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
                    'total' => $users->total()
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.'
            ], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin_hotel,user,super_admin',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,blocked,inactive',
            'hotel_name' => 'nullable|string|max:255'
        ]);

        try {
            $this->userService->createUser($validated, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil ditambahkan.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pengguna.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        // 1. Terima data dari React (apapun bentuk hurufnya)
        $request->validate([
            'status' => 'required|in:Active,Blocked,Inactive,active,blocked,inactive'
        ]);

        try {
            $user = User::findOrFail($id);

            if ($user->id === $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengubah status akun Anda sendiri.'
                ], 400);
            }

            // 2. PERBAIKAN: Paksa menjadi huruf kecil semua agar lolos dari aturan database Supabase
            $statusToSave = strtolower($request->status);

            $this->userService->updateUserStatus($user, $statusToSave, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Status pengguna berhasil diperbarui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status pengguna.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateRole(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:admin_hotel,user'
        ]);

        try {
            $user = User::findOrFail($id);

            if ($user->id === $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengubah role akun Anda sendiri.'
                ], 400);
            }

            $this->userService->updateUserRole($user, $validated['role'], $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil diperbarui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui role pengguna.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Mencegah Super Admin menghapus dirinya sendiri
            if ($user->id === $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus akun Anda sendiri.'
                ], 400);
            }

            $this->userService->deleteUser($user, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengguna. Pengguna mungkin masih memiliki data terkait.'
            ], 500);
        }
    }
}
