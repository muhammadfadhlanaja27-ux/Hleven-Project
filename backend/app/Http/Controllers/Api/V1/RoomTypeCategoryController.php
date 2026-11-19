<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Models\RoomTypeCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RoomTypeCategoryController extends Controller
{
    /**
 * Daftar kategori tipe kamar hotel.
 *
 * Menampilkan daftar semua kategori tipe kamar untuk hotel yang
 * dimiliki user yang login. Setiap kategori mencakup penghitungan
 * jumlah tipe kamar yang terkait ($withCount('roomTypes')).
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi array kategori beserta jumlah kamar
     */
    public function index(Request $request): JsonResponse
    {
        $hotel = $this->currentHotel($request);

        if (! $hotel) {
            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => [],
            ]);
        }

        $categories = RoomTypeCategory::where('hotel_id', $hotel->id)
            ->withCount('roomTypes')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
 * Menambah kategori tipe kamar baru.
 *
 * Proses create room type category beserta validasi unik terhadap
 * nama kategori dalam scope hotel yang sama.
 *
 * Validasi input:
 * - name: required, string, max 100, harus unik di dalam hotel
 * - description: opsional, string, max 1000 karakter
 * - status: opsional, harus 'active' atau 'inactive' (default: active)
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi data kategori yang baru dibuat
     */
    public function store(Request $request): JsonResponse
    {
        $hotel = $this->currentHotel($request);

        if (! $hotel) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('room_type_categories', 'name')
                    ->where('hotel_id', $hotel->id)
                    ->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:active,inactive',
        ]);

        $category = RoomTypeCategory::create([
            'hotel_id' => $hotel->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Tipe kamar berhasil ditambahkan.',
            'data' => $category->loadCount('roomTypes'),
        ], 201);
    }

    /**
 * Menampilkan detail kategori tipe kamar tertentu.
 *
 * Mengambil data kategori tipe kamar berdasarkan ID beserta
 * penghitungan jumlah tipe kamar yang terkait.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID kategori tipe kamar
 * @return \Illuminate\Http\JsonResponse JSON response berisi detail kategori
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $category = $this->findForHotel($request, $id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tipe kamar tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $category->loadCount('roomTypes'),
        ]);
    }

    /**
 * Mengubah kategori tipe kamar.
 *
 * Proses update kategori tipe kamar dengan validasi fleksibel ("sometimes")
 * yang mencakup pembaharuan nama, deskripsi, dan status.
 * Validasi unik nama kategori diabaikan jika nama tidak berubah.
 *
 * Logika bisnis: apabila nama kategori diubah, field `type` di
 * tabel room_types juga akan diperbarui secara otomatis untuk
 * mencocokkan dengan nama kategori baru.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID kategori tipe kamar
 * @return \Illuminate\Http\JsonResponse JSON response berisi data kategori yang sudah diupdate
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = $this->findForHotel($request, $id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tipe kamar tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('room_type_categories', 'name')
                    ->where('hotel_id', $category->hotel_id)
                    ->whereNull('deleted_at')
                    ->ignore($category->id),
            ],
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:active,inactive',
        ]);

        DB::transaction(function () use ($category, $validated) {
            $oldName = $category->name;
            $category->update($validated);

            if ($category->name !== $oldName) {
                RoomType::where('room_type_category_id', $category->id)
                    ->update(['type' => $category->name]);
            }
        });

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Tipe kamar berhasil diperbarui.',
            'data' => $category->fresh()->loadCount('roomTypes'),
        ]);
    }

    /**
 * Menghapus kategori tipe kamar.
 *
 * Proses delete kategori tipe kamar dengan validasi dependent:
 * mengecek apakah kategori masih digunakan oleh tipe kamar
 * sebelum melakukan penghapusan.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID kategori tipe kamar
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses/gagal penghapusan
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = $this->findForHotel($request, $id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tipe kamar tidak ditemukan.',
            ], 404);
        }

        if ($category->roomTypes()->exists()) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tipe kamar tidak dapat dihapus karena masih dipakai oleh kamar.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Tipe kamar berhasil dihapus.',
        ]);
    }

    private function currentHotel(Request $request)
    {
        $user = $request->user();

        return $user->hotel ?? $user->hotels()->first();
    }

    private function findForHotel(Request $request, int $id): ?RoomTypeCategory
    {
        $hotel = $this->currentHotel($request);

        if (! $hotel) {
            return null;
        }

        return RoomTypeCategory::where('hotel_id', $hotel->id)->find($id);
    }
}
