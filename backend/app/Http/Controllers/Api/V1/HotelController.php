<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    // 1. Menampilkan daftar semua hotel (Publik)
    public function index(): JsonResponse
    {
        try {
            $hotels = Hotel::with(['city', 'photos', 'facilities', 'rooms'])->get();

            return response()->json([
                'success' => true,
                'message' => 'Daftar hotel berhasil dimuat',
                'data' => $hotels,
            ], 200);
        } catch (\Exception $e) {
            $hotels = Hotel::all();

            return response()->json([
                'success' => true,
                'message' => 'Daftar hotel dimuat (tanpa relasi)',
                'data' => $hotels,
            ], 200);
        }
    }

    // 2. Menampilkan detail 1 hotel berdasarkan ID (Publik)
    public function show($id): JsonResponse
    {
        try {
            $hotel = Hotel::find($id);

            if (!$hotel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hotel tidak ditemukan.',
                ], 404);
            }

            // Safe loading relasi secara bertahap
            try { $hotel->load('city'); } catch (\Exception $e) {}
            try { $hotel->load('photos'); } catch (\Exception $e) {}
            try { $hotel->load('facilities'); } catch (\Exception $e) {}
            try { $hotel->load('rooms'); } catch (\Exception $e) {}

            return response()->json([
                'success' => true,
                'message' => 'Detail hotel berhasil dimuat',
                'data' => $hotel,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 3. Menampilkan daftar hotel milik admin yang sedang login
    public function myHotels(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel;

        $query = Hotel::with(['city', 'photos', 'facilities']);
        
        if ($user && $user->role === 'admin_hotel') {
            $query->where('admin_id', $user->id);
        }

        return response()->json([
            'status' => 'success',
            'data' => $hotel
        ]);
    }

    // 4. Update profil hotel milik admin
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if ($user->role === 'admin_hotel' && $hotel->admin_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengubah hotel ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:150',
            'address' => 'sometimes|string',
            'phone' => 'sometimes|string|max:20',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'city_id' => 'required|exists:cities,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'facilities' => 'array',
            'facilities.*' => 'exists:facilities,id',
        ]);

        $hotel->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . $hotel->id,
            'description' => $request->description,
            'address' => $request->address,
            'city_id' => $request->city_id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        if ($request->has('facilities')) {
            $hotel->facilities()->sync($request->facilities);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil hotel berhasil diperbarui',
            'data' => $hotel->load(['city', 'facilities', 'photos']),
        ], 200);
    }

    // 5. Upload foto galeri hotel
    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $hotel = Hotel::findOrFail($id);

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'is_thumbnail' => 'boolean',
        ]);

        $path = $request->file('photo')->store('hotels', 'public');

        if ($request->is_thumbnail) {
            $hotel->photos()->update(['is_thumbnail' => false]);
        }

        $hotel->update($request->except('image'));
        $hotel->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil diunggah',
            'data' => $hotelPhoto,
        ], 201);
    }

    // 6. Hapus foto hotel
    public function deletePhoto($hotelId, $photoId): JsonResponse
    {
        $hotel = Hotel::findOrFail($hotelId);
        $photo = $hotel->photos()->findOrFail($photoId);

        if (Storage::disk('public')->exists($photo->photo)) {
            Storage::disk('public')->delete($photo->photo);
        }

        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus',
        ], 200);
    }
}