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
