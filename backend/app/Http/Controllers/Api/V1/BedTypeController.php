<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BedType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BedTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $bedTypes = BedType::where('hotel_id', $hotel->id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bedTypes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('bed_types', 'name')
                    ->where('hotel_id', $hotel->id)
                    ->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:active,inactive',
        ]);

        $bedType = BedType::create([
            ...$validated,
            'hotel_id' => $hotel->id,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tipe kasur berhasil ditambahkan.',
            'data' => $bedType,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $bedType = BedType::where('hotel_id', $hotel->id)->findOrFail($id);
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('bed_types', 'name')
                    ->where('hotel_id', $hotel->id)
                    ->whereNull('deleted_at')
                    ->ignore($bedType->id),
            ],
            'description' => 'sometimes|nullable|string|max:1000',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $bedType->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tipe kasur berhasil diperbarui.',
            'data' => $bedType->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $bedType = BedType::where('hotel_id', $hotel->id)->findOrFail($id);
        if ($bedType->roomTypes()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe kasur masih digunakan kamar. Nonaktifkan tipe kasur ini agar tidak dapat dipilih untuk kamar baru.',
            ], 422);
        }

        $bedType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipe kasur berhasil dihapus.',
        ]);
    }
}
