<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BedType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BedTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => [],
            ]);
        }

        $bedTypes = BedType::where('hotel_id', $hotel->id)
            ->withCount('roomTypes')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $bedTypes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
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
                Rule::unique('bed_types', 'name')
                    ->where('hotel_id', $hotel->id)
                    ->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:active,inactive',
            'size' => 'nullable|string|max:100',
            'max_adults' => 'nullable|integer|min:1',
            'max_children' => 'nullable|integer|min:0',
            'max_total' => 'nullable|integer|min:1',
        ]);

        $maxAdults = $validated['max_adults'] ?? 1;
        $maxChildren = $validated['max_children'] ?? 0;
        $maxTotal = $validated['max_total'] ?? ($maxAdults + $maxChildren);

        $this->validateCapacity($maxAdults, $maxChildren, $maxTotal);

        $bedType = BedType::create([
            ...$validated,
            'hotel_id' => $hotel->id,
            'status' => $validated['status'] ?? 'active',
            'max_adults' => $maxAdults,
            'max_children' => $maxChildren,
            'max_total' => $maxTotal,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Tipe kasur berhasil ditambahkan.',
            'data' => $bedType->loadCount('roomTypes'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Hotel not found.',
            ], 404);
        }

        $bed = BedType::where('hotel_id', $hotel->id)->find($id);
        if (! $bed) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Bed type not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $bed->loadCount('roomTypes'),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $bedType = BedType::where('hotel_id', $hotel->id)->find($id);
        if (! $bedType) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Bed type not found',
            ], 404);
        }

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
            'size' => 'sometimes|nullable|string|max:100',
            'max_adults' => 'sometimes|integer|min:1',
            'max_children' => 'sometimes|integer|min:0',
            'max_total' => 'sometimes|integer|min:1',
        ]);

        $maxAdults = $validated['max_adults'] ?? $bedType->max_adults;
        $maxChildren = $validated['max_children'] ?? $bedType->max_children;
        $maxTotal = $validated['max_total'] ?? $bedType->max_total;

        $this->validateCapacity($maxAdults, $maxChildren, $maxTotal);

        $bedType->update($validated);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Tipe kasur berhasil diperbarui.',
            'data' => $bedType->fresh()->loadCount('roomTypes'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $hotel = $request->user()->hotel ?? $request->user()->hotels()->first();
        if (! $hotel) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Hotel untuk akun ini tidak ditemukan.',
            ], 404);
        }

        $bedType = BedType::where('hotel_id', $hotel->id)->find($id);
        if (! $bedType) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Bed type not found',
            ], 404);
        }

        if ($bedType->roomTypes()->exists()) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tipe kasur masih digunakan kamar. Nonaktifkan tipe kasur ini agar tidak dapat dipilih untuk kamar baru.',
            ], 422);
        }

        $bedType->delete();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Tipe kasur berhasil dihapus.',
        ]);
    }

    private function validateCapacity(int $adults, int $children, int $total): void
    {
        if ($total < ($adults + $children)) {
            throw ValidationException::withMessages([
                'max_total' => 'Total tamu tidak boleh kurang dari jumlah dewasa dan anak.',
            ]);
        }
    }
}
