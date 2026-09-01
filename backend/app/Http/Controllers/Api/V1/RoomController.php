<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookingRoom;
use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource (Dukungan pencarian dinamis stok untuk User).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Ambil hotel_id dari query param (user) atau dari user model (admin fallback)
        $hotelId = $request->query('hotel_id');
        if (! $hotelId) {
            $hotel = $user?->hotel ?? Hotel::first();
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
            ->with(['photos', 'facilities'])
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

            $rooms->each(function ($room) use ($bookedQuantities) {
                $room->available_stock = max(0, $room->stock - ($bookedQuantities[$room->id] ?? 0));
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? Hotel::first();

        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'type'           => 'nullable|string|max:100',
            'description'    => 'nullable|string',
            'weekday_price'  => 'required|numeric|min:0',
            'weekend_price'  => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'capacity_adult' => 'required|integer|min:1',
            'capacity_child' => 'required|integer|min:0',
            'breakfast' => 'boolean',
            'smoking_area' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $room = RoomType::create([
            'hotel_id'       => $hotel->id,
            'name'           => $request->name,
            'type'           => $request->type ?? 'Standard',
            'description'    => $request->description,
            'weekday_price'  => $request->weekday_price,
            'weekend_price'  => $request->weekend_price,
            'stock'          => $request->stock,
            'capacity_adult' => $request->capacity_adult,
            'capacity_child' => $request->capacity_child,
            'breakfast' => $request->breakfast ?? false,
            'smoking_area' => $request->smoking_area ?? false,
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rooms', 's3');
            $url = Storage::disk('s3')->url($path);
            $room->photos()->create([
                'photo' => $url,
                'is_thumbnail' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil ditambahkan',
            'data'    => $room->load(['photos', 'facilities']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $room = RoomType::with(['photos', 'facilities', 'hotel'])->find($id);

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
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $room = RoomType::find($id);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'sometimes|required|string|max:255',
            'type'           => 'nullable|string|max:100',
            'description'    => 'nullable|string',
            'weekday_price'  => 'sometimes|required|numeric|min:0',
            'weekend_price'  => 'sometimes|required|numeric|min:0',
            'stock'          => 'sometimes|required|integer|min:0',
            'capacity_adult' => 'sometimes|required|integer|min:1',
            'capacity_child' => 'sometimes|integer|min:0',
            'breakfast'      => 'boolean',
            'smoking_area'   => 'boolean',
            'facilities'     => 'nullable|array',
            'facilities.*'   => 'exists:facilities,id',
            'photos'         => 'nullable|array',
            'photos.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update kolom utama (gunakan only agar tidak ada kolom asing)
        $updateData = $request->only([
            'name', 'type', 'description', 'weekday_price', 'weekend_price',
            'stock', 'capacity_adult', 'capacity_child', 'breakfast', 'smoking_area',
        ]);

        $room->update($updateData);

        // Sync fasilitas jika dikirimkan (termasuk array kosong = hapus semua)
        // Catatan: FormData bisa mengirim string kosong "" untuk array kosong
        if ($request->has('facilities')) {
            $facilities = $request->input('facilities');
            if ($facilities === '' || $facilities === null) {
                $facilities = [];
            }
            if (is_array($facilities)) {
                $room->facilities()->sync(array_filter($facilities, fn($v) => is_numeric($v)));
            }
        }

        // Upload foto baru jika ada; pastikan foto baru mengganti thumbnail utama
        if ($request->hasFile('photos')) {
            $room->photos()->update(['is_thumbnail' => false]);

            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('room_types', 's3');
                $url = Storage::disk('s3')->url($path);
                $room->photos()->create([
                    'photo'        => $url,
                    'is_thumbnail' => $index === 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data'    => $room->load(['photos', 'facilities']),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $room = RoomType::find($id);

            if (! $room) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamar tidak ditemukan',
                ], 404);
            }

            // Hapus berkas foto fisik dari storage
            foreach ($room->photos as $photo) {
                if ($photo->photo) {
                    $oldPath = ltrim(strstr(parse_url($photo->photo, PHP_URL_PATH), '/public/'), '/public/');
                    if (Storage::disk('s3')->exists($oldPath)) {
                        Storage::disk('s3')->delete($oldPath);
                    }
                }
                $photo->delete();
            }

            $room->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kamar berhasil dihapus',
            ], 200);

        } catch (QueryException $e) {
            // Menangkap Foreign Key Constraint Violation agar tidak crash Error 500
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
}
