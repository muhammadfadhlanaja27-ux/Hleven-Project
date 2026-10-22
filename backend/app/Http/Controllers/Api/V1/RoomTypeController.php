<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BedType;
use App\Models\RoomType;
use App\Models\RoomTypeCategory;
use App\Services\FileStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RoomTypeController extends Controller
{
    /**
     * Cari tipe kamar milik hotel admin yang login (cegah IDOR lintas hotel).
     */
    private function findRoomTypeForUser(Request $request, $id, array $with = []): ?RoomType
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return null;
        }

        return RoomType::with($with)->where('hotel_id', $hotel->id)->find($id);
    }

    /**
     * Menampilkan daftar tipe kamar milik hotel yang sedang login
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $roomTypes = RoomType::where('hotel_id', $hotel->id)->with(['photos', 'facilities', 'bedType', 'category'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $roomTypes,
        ]);
    }

    /**
     * Menambah tipe kamar baru (Disesuaikan dengan RoomCreate.jsx & Model RoomType)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'room_type_category_id' => [
                'nullable',
                'integer',
                Rule::exists('room_type_categories', 'id')->where('hotel_id', $hotel->id)->whereNull('deleted_at'),
            ],
            'bed' => 'nullable|string|max:100',
            'bed_type_id' => [
                'nullable',
                'integer',
                Rule::exists('bed_types', 'id')->where('hotel_id', $hotel->id)->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string',
            'weekday_price' => 'required|numeric|min:0',
            'weekend_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'capacity_adult' => 'nullable|integer|min:1',
            'capacity_child' => 'nullable|integer|min:0',
            'is_refundable' => 'nullable|boolean',
            'policies' => 'nullable|string|max:5000',
            'facilities' => 'nullable|array',
            'facilities.*' => [Rule::exists('facilities', 'id')->where(fn ($q) => $q->where('hotel_id', $hotel->id)->orWhereNull('hotel_id'))],
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        [$capacityAdult, $capacityChild] = $this->resolveCapacities($request);

        // 1. Buat data utama RoomType (disesuaikan dengan kolom model: capacity_adult & capacity_child)
        DB::beginTransaction();
        try {
            $bedType = $request->filled('bed_type_id')
                ? BedType::where('hotel_id', $hotel->id)->findOrFail($request->integer('bed_type_id'))
                : null;

            $category = $request->filled('room_type_category_id')
                ? RoomTypeCategory::where('hotel_id', $hotel->id)->find($request->integer('room_type_category_id'))
                : null;

            $roomType = RoomType::create([
                'hotel_id' => $hotel->id,
                'room_type_category_id' => $category?->id,
                'name' => $request->name,
                'type' => $category?->name ?? $request->type ?? 'Standard',
                'bed' => $bedType?->name ?? $request->bed,
                'bed_type_id' => $bedType?->id,
                'description' => $request->description,
                'weekday_price' => $request->weekday_price,
                'weekend_price' => $request->weekend_price,
                'stock' => $request->stock,
                'capacity_adult' => $capacityAdult,
                'capacity_child' => $capacityChild,
                'breakfast' => $request->boolean('breakfast'),
                'smoking_area' => $request->boolean('smoking_area'),
                'is_refundable' => $request->boolean('is_refundable', true),
                'policies' => $request->policies,
            ]);

            // 2. Simpan relasi fasilitas ke tabel pivot `room_facilities`
            if ($request->has('facilities')) {
                $roomType->facilities()->sync($request->facilities);
            }

            // 3. Simpan multiple foto jika ada
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $index => $photo) {
                    $url = app(FileStorageService::class)->uploadFile($photo, 'room_types');
                    $roomType->photos()->create([
                        'photo' => $url,
                        'is_thumbnail' => $index === 0,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Room type created successfully',
                'data' => $roomType->load(['photos', 'facilities', 'bedType', 'category']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan kamar: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menampilkan detail tipe kamar tertentu
     */
    public function show(Request $request, $id)
    {
        $roomType = $this->findRoomTypeForUser($request, $id, ['photos', 'facilities', 'hotel', 'bedType']);

        if (! $roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $roomType,
        ]);
    }

    /**
     * Mengubah data tipe kamar
     */
    public function update(Request $request, $id)
    {
        $roomType = $this->findRoomTypeForUser($request, $id);

        if (! $roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel || (int) $roomType->hotel_id !== (int) $hotel->id) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'nullable|string|max:100',
            'room_type_category_id' => [
                'nullable',
                'integer',
                Rule::exists('room_type_categories', 'id')->where('hotel_id', $roomType->hotel_id)->whereNull('deleted_at'),
            ],
            'bed' => 'nullable|string|max:100',
            'bed_type_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('bed_types', 'id')->where('hotel_id', $roomType->hotel_id)->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string',
            'weekday_price' => 'sometimes|numeric|min:0',
            'weekend_price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'capacity_adult' => 'nullable|integer|min:1',
            'capacity_child' => 'nullable|integer|min:0',
            'is_refundable' => 'nullable|boolean',
            'policies' => 'nullable|string|max:5000',
            'facilities' => 'nullable|array',
            'facilities.*' => [Rule::exists('facilities', 'id')->where(fn ($q) => $q->where('hotel_id', $roomType->hotel_id)->orWhereNull('hotel_id'))],
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        // Mapping inputan dari request ke kolom database model
        $updateData = $request->only([
            'name', 'type', 'description', 'weekday_price', 'weekend_price',
            'stock', 'policies',
        ]);

        if ($request->exists('room_type_category_id')) {
            $category = $request->filled('room_type_category_id')
                ? RoomTypeCategory::where('hotel_id', $roomType->hotel_id)->find($request->integer('room_type_category_id'))
                : null;

            $updateData['room_type_category_id'] = $category?->id;

            if ($category) {
                $updateData['type'] = $category->name;
            }
        }

        if ($request->has('bed')) {
            $updateData['bed'] = $request->bed;
        }
        if ($request->exists('bed_type_id')) {
            $bedType = $request->filled('bed_type_id')
                ? BedType::where('hotel_id', $hotel->id)->find($request->integer('bed_type_id'))
                : null;
            $updateData['bed_type_id'] = $bedType?->id;
            $updateData['bed'] = $bedType?->name ?? $request->input('bed');
            [$updateData['capacity_adult'], $updateData['capacity_child']] = $this->resolveCapacities($request);
        } elseif ($request->has('capacity_adult') || $request->has('capacity_child')) {
            [$updateData['capacity_adult'], $updateData['capacity_child']] = $this->resolveCapacities($request);
        }
        if ($request->has('breakfast')) {
            $updateData['breakfast'] = $request->boolean('breakfast');
        }
        if ($request->has('smoking_area')) {
            $updateData['smoking_area'] = $request->boolean('smoking_area');
        }
        if ($request->has('is_refundable')) {
            $updateData['is_refundable'] = $request->boolean('is_refundable');
        }
        if ($request->has('policies')) {
            $updateData['policies'] = $request->policies;
        }

        $roomType->update($updateData);

        // Update relasi fasilitas jika dikirimkan
        if ($request->has('facilities')) {
            $roomType->facilities()->sync($request->facilities);
        }

        // Simpan foto tambahan jika ada; pastikan foto baru menjadi thumbnail utama
        if ($request->hasFile('photos')) {
            $roomType->photos()->update(['is_thumbnail' => false]);

            foreach ($request->file('photos') as $index => $photo) {
                $url = app(FileStorageService::class)->uploadFile($photo, 'room_types');
                $roomType->photos()->create([
                    'photo' => $url,
                    'is_thumbnail' => $index === 0,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Room type updated successfully',
            'data' => $roomType->load(['photos', 'facilities', 'bedType', 'category']),
        ]);
    }

    /**
     * Menghapus tipe kamar
     */
    public function destroy(Request $request, $id)
    {
        $roomType = $this->findRoomTypeForUser($request, $id);

        if (! $roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        // Hapus foto-foto terkait di storage jika ada
        foreach ($roomType->photos as $photo) {
            $photoUrl = $photo->photo ?? $photo->image_path ?? null;
            if ($photoUrl) {
                app(FileStorageService::class)->deleteFile($photoUrl);
            }
        }
        $roomType->photos()->delete();

        // Hapus relasi pivot fasilitas
        $roomType->facilities()->detach();

        $roomType->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Room type deleted successfully',
        ]);
    }

    /**
     * Tentukan kapasitas dewasa/anak. Bila bed_type_id dipilih, ambil dari BedType.
     */
    private function resolveCapacities(Request $request): array
    {
        if ($request->filled('bed_type_id')) {
            $bed = BedType::find($request->input('bed_type_id'));
            if ($bed) {
                return [(int) $bed->max_adults, (int) $bed->max_children];
            }
        }

        return [
            max(1, (int) $request->input('capacity_adult', 2)),
            max(0, (int) $request->input('capacity_child', 0)),
        ];
    }
}
