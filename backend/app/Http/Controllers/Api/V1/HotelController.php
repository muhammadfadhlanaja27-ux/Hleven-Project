<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    /**
     * Menampilkan semua daftar hotel aktif (Public)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Hotel::with([
            'city', 
            'photos', 
            'facilities', 
            'roomTypes' // Menampilkan semua roomTypes tanpa filter kolom is_active
        ])->where('status', 'active'); 

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $hotels = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar hotel berhasil dimuat',
            'data'    => $hotels,
        ], 200);
    }

    /**
     * Menampilkan detail hotel berdasarkan ID (Public)
     */
    public function show($id): JsonResponse
    {
        $hotel = Hotel::with([
            'city', 
            'photos', 
            'facilities', 
            'roomTypes', // Dihapus filter is_active agar SQL Supabase tidak crash
            'roomTypes.photos', 
            'roomTypes.facilities'
        ])
        ->where('status', 'active')
        ->find($id);

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan atau sedang tidak aktif.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail hotel berhasil dimuat',
            'data'    => $hotel,
        ], 200);
    }

    /**
     * Menampilkan profil hotel khusus untuk Admin Hotel
     */
    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $hotel->load(['city', 'facilities', 'photos']);

        return response()->json([
            'success' => true,
            'message' => 'Profil hotel berhasil dimuat',
            'data'    => $hotel,
        ], 200);
    }

    /**
     * Mengambil daftar hotel milik admin yang sedang login
     */
    public function myHotels(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data hotel berhasil diambil',
            'data'    => [$hotel->load(['city', 'facilities', 'photos'])]
        ], 200);
    }

    /**
     * Memperbarui profil hotel (Admin Hotel)
     */
    public function update(Request $request, $id = null): JsonResponse
    {
        $user = $request->user();

        if ($id) {
            $userHotels = [$user->hotel->id ?? null] + ($user->hotels->pluck('id')->toArray() ?? []);
            if (!in_array($id, array_filter($userHotels))) {
                $hotel = Hotel::first();
            } else {
                $hotel = Hotel::find($id);
            }
        } else {
            $hotel = $user->hotel ?? Hotel::first();
        }

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $request->validate([
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'address'      => 'sometimes|string',
            'phone'        => 'sometimes|string',
            'banner'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'facilities'   => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
        ]);

        if ($request->hasFile('banner')) {
            if ($hotel->banner && Storage::disk('public')->exists($hotel->banner)) {
                Storage::disk('public')->delete($hotel->banner);
            }
            $hotel->banner = $request->file('banner')->store('hotels/banners', 'public');
        }

        $hotel->update($request->only(['name', 'description', 'address', 'phone']));

        if ($request->has('facilities')) {
            $hotel->facilities()->sync($request->facilities);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil hotel berhasil diperbarui',
            'data'    => $hotel->load(['city', 'facilities', 'photos']),
        ], 200);
    }

    /**
     * Upload foto galeri hotel
     */
    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $hotel = Hotel::findOrFail($id);

        $request->validate([
            'photo'        => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'is_thumbnail' => 'boolean',
        ]);

        $path = $request->file('photo')->store('hotels', 'public');

        if ($request->is_thumbnail) {
            $hotel->photos()->update(['is_thumbnail' => false]);
        }

        $hotelPhoto = $hotel->photos()->create([
            'photo'        => $path,
            'is_thumbnail' => $request->is_thumbnail ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil diunggah',
            'data'    => $hotelPhoto,
        ], 201);
    }

    /**
     * Hapus foto galeri hotel
     */
    public function deletePhoto($hotelId, $photoId): JsonResponse
    {
        $hotel = Hotel::findOrFail($hotelId);
        $photo = $hotel->photos()->findOrFail($photoId);

        if (Storage::disk('public')->exists($photo->photo)) {
            Storage::disk('public')->delete($photo->photo);
        }

        $photo->delete();

        return response()->json(['success' => true, 'message' => 'Foto hotel berhasil dihapus'], 200);
    }
}