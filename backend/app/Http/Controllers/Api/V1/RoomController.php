<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BedType;
use App\Models\BookingRoom;
use App\Models\Hotel;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use App\Services\FileStorageService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    /**
     * Cari kamar yang benar-benar milik hotel admin yang login (cegah IDOR lintas hotel).
     */
    private function findRoomForUser(Request $request, $id, array $with = []): ?RoomType
    {
        $user = $request->user();
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first()) : null;

        if (! $hotel) {
            return null;
        }

        return RoomType::with($with)->where('hotel_id', $hotel->id)->find($id);
    }

    /**
     * Display a listing of the resource (Dukungan pencarian dinamis stok untuk User).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $hotelId = $request->query('hotel_id') ?? $request->route('id');
        if (! $hotelId) {
            $hotel = $user?->hotel ?? $user?->hotels()->first();
            $hotelId = $hotel?->id;
        }

        if (! $hotelId) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel tidak ditemukan.',
            ], 404);
        }

        $checkIn = $request->query('check_in');
        $checkOut = $request->query('check_out');

        $rooms = RoomType::where('hotel_id', $hotelId)
            ->with(['photos', 'facilities', 'bedType'])
            ->get();

        if ($checkIn && $checkOut) {
            $roomTypeIds = $rooms->pluck('id');

            $bookedQuantities = BookingRoom::whereIn('room_type_id', $roomTypeIds)
                ->whereHas('booking', function ($q) use ($checkIn, $checkOut) {
                    $q->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed'])
                        ->where('check_in', '<', $checkOut)
                        ->where('check_out', '>', $checkIn);
                })
                ->select('room_type_id', DB::raw('SUM(qty) as total_booked'))
                ->groupBy('room_type_id')
                ->pluck('total_booked', 'room_type_id');

            $closedTypeIds = RoomAvailability::whereIn('room_type_id', $roomTypeIds)
                ->where('is_closed', true)
                ->where('date', '>=', $checkIn)
                ->where('date', '<', $checkOut)
                ->pluck('room_type_id')
                ->unique();

            $rooms->each(function ($room) use ($bookedQuantities, $closedTypeIds) {
                $room->available_stock = $closedTypeIds->contains($room->id)
                    ? 0
                    : max(0, $room->stock - ($bookedQuantities[$room->id] ?? 0));
            });
        } else {
            $rooms->each(function ($room) {
                $room->available_stock = $room->stock;
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar kamar berhasil dimuat',
            'data' => $rooms,
        ], 200);
    }

    /**
     * Store a newly created resource in storage (Storage Lokal).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'type'           => 'nullable|string|max:100',
            'bed'            => 'nullable|string|max:100',
            'bed_type_id'    => [
                'nullable',
                'integer',
                Rule::exists('bed_types', 'id')->where('hotel_id', $hotel->id)->whereNull('deleted_at'),
            ],
            'description'    => 'nullable|string',
            'weekday_price'  => 'required|numeric|min:0',
            'weekend_price'  => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'capacity_adult' => 'nullable|integer|min:1',
            'capacity_child' => 'nullable|integer|min:0',
            'breakfast' => 'nullable|boolean',
            'smoking_area' => 'nullable|boolean',
            'is_refundable' => 'nullable|boolean',
            'facilities' => 'nullable|array',
            'facilities.*' => [Rule::exists('facilities', 'id')->where(fn ($q) => $q->where('hotel_id', $hotel->id)->orWhereNull('hotel_id'))],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $bedType = $request->filled('bed_type_id')
            ? BedType::where('hotel_id', $hotel->id)->find($request->integer('bed_type_id'))
            : null;

        [$capacityAdult, $capacityChild] = $this->resolveCapacities($request);

        $room = RoomType::create([
            'hotel_id'       => $hotel->id,
            'bed_type_id'    => $bedType?->id,
            'name'           => $request->name,
            'type'           => $request->type ?? 'Standard',
            'bed'            => $bedType?->name ?? $request->bed,
            'description'    => $request->description,
            'weekday_price'  => $request->weekday_price,
            'weekend_price'  => $request->weekend_price,
            'stock'          => $request->stock,
            'capacity_adult' => $capacityAdult,
            'capacity_child' => $capacityChild,
            'breakfast'      => $request->boolean('breakfast', false),
            'smoking_area'   => $request->boolean('smoking_area', false),
            'is_refundable'  => $request->boolean('is_refundable', true),
        ]);

        if ($request->has('facilities')) {
            $facilities = $request->input('facilities');
            if ($facilities === '' || $facilities === null) {
                $facilities = [];
            }
            if (is_array($facilities)) {
                $room->facilities()->sync(array_filter($facilities, fn ($value) => is_numeric($value)));
            }
        }

        if ($request->hasFile('image')) {
            $url = app(FileStorageService::class)->uploadFile($request->file('image'), 'rooms');
            $room->photos()->create([
                'photo' => $url,
                'is_thumbnail' => true,
            ]);
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $url = app(FileStorageService::class)->uploadFile($photo, 'rooms');
                $room->photos()->create([
                    'photo' => $url,
                    'is_thumbnail' => $index === 0 && ! $room->photos()->exists(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil ditambahkan',
            'data'    => $room->load(['photos', 'facilities', 'bedType']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $room = $this->findRoomForUser($request, $id, ['photos', 'facilities', 'hotel', 'bedType']);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kamar berhasil dimuat',
            'data' => $room,
        ], 200);
    }

    /**
     * Update the specified resource in storage (Storage Lokal).
     */
    public function update(Request $request, $id): JsonResponse
    {
        $room = $this->findRoomForUser($request, $id);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel || (int) $room->hotel_id !== (int) $hotel->id) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'sometimes|required|string|max:255',
            'type'           => 'nullable|string|max:100',
            'bed'            => 'nullable|string|max:100',
            'bed_type_id'    => [
                'nullable',
                'integer',
                Rule::exists('bed_types', 'id')->where('hotel_id', $hotel->id)->whereNull('deleted_at'),
            ],
            'description'    => 'nullable|string',
            'weekday_price'  => 'sometimes|required|numeric|min:0',
            'weekend_price'  => 'sometimes|required|numeric|min:0',
            'stock'          => 'sometimes|required|integer|min:0',
            'capacity_adult' => 'nullable|integer|min:1',
            'capacity_child' => 'nullable|integer|min:0',
            'breakfast'      => 'boolean',
            'smoking_area'   => 'boolean',
            'facilities'     => 'nullable|array',
            'facilities.*'   => [Rule::exists('facilities', 'id')->where(fn ($q) => $q->where('hotel_id', $room->hotel_id)->orWhereNull('hotel_id'))],
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'photos'         => 'nullable|array',
            'photos.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = $request->only([
            'name', 'type', 'bed', 'description', 'weekday_price', 'weekend_price',
            'stock', 'breakfast', 'smoking_area',
        ]);
        if ($request->exists('bed_type_id')) {
            $bedType = $request->filled('bed_type_id')
                ? BedType::where('hotel_id', $hotel->id)->findOrFail($request->integer('bed_type_id'))
                : null;
            $updateData['bed_type_id'] = $bedType?->id;
            $updateData['bed'] = $bedType?->name ?? $request->input('bed');
            [$updateData['capacity_adult'], $updateData['capacity_child']] = $this->resolveCapacities($request);
        } elseif ($request->has('capacity_adult') || $request->has('capacity_child')) {
            [$updateData['capacity_adult'], $updateData['capacity_child']] = $this->resolveCapacities($request);
        }

        if ($request->has('is_refundable')) {
            $updateData['is_refundable'] = $request->boolean('is_refundable', true);
        }

        $room->update($updateData);

        if ($request->has('facilities')) {
            $facilities = $request->input('facilities');
            if ($facilities === '' || $facilities === null) {
                $facilities = [];
            }
            if (is_array($facilities)) {
                $room->facilities()->sync(array_filter($facilities, fn ($v) => is_numeric($v)));
            }
        }

        // Upload single image jika dikirimkan sebagai 'image'
        if ($request->hasFile('image')) {
            $url = app(FileStorageService::class)->uploadFile($request->file('image'), 'rooms');
            $room->photos()->create([
                'photo' => $url,
                'is_thumbnail' => $room->photos()->count() === 0,
            ]);
        }

        // Upload multiple photos jika dikirimkan sebagai array 'photos'
        if ($request->hasFile('photos')) {
            $hasExistingPhotos = $room->photos()->count() > 0;
            foreach ($request->file('photos') as $index => $photo) {
                $url = app(FileStorageService::class)->uploadFile($photo, 'rooms');
                $room->photos()->create([
                    'photo' => $url,
                    'is_thumbnail' => ! $hasExistingPhotos && $index === 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data'    => $room->load(['photos', 'facilities', 'bedType']),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $room = $this->findRoomForUser($request, $id);

            if (! $room) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamar tidak ditemukan',
                ], 404);
            }

            foreach ($room->photos as $photo) {
                if ($photo->photo) {
                    app(FileStorageService::class)->deleteFile($photo->photo);
                }
                $photo->delete();
            }

            $room->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kamar berhasil dihapus',
            ], 200);

        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak dapat dihapus karena masih terikat dengan data pemesanan/transaksi.',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: '.$e->getMessage(),
            ], 500);
        }
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
