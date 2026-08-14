<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HotelController extends Controller
{
    /**
     * 🟢 BARU: Menampilkan semua daftar hotel aktif (Public)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Hotel::with(['city', 'photos', 'facilities'])
            ->where('status', 'active');

        // Filter sederhana berdasarkan kata kunci pencarian (opsional)
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
     * 🟢 BARU: Menampilkan detail hotel berdasarkan ID (GET /api/v1/hotels/{id})
     * Ini yang tadi bikin error 500 karena fungsinya belum ada!
     */
    public function show($id): JsonResponse
    {
        // Panggil relasi yang dibutuhkan oleh H'Leven SRS
        // Catatan: Pastikan relasi kamar di Model Hotel.php bernama 'roomTypes' atau 'rooms'
        $hotel = Hotel::with([
            'city', 
            'photos', 
            'facilities', 
            'roomTypes', // Ubah ke 'rooms' jika nama fungsi relasi di Model Hotel.php adalah rooms()
            'reviews.user'
        ])->find($id);

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail hotel berhasil dimuat',
            'data'    => [
                'hotel'      => $hotel,
                'photos'     => $hotel->photos,
                'facilities' => $hotel->facilities,
                'rooms'      => $hotel->roomTypes ?? $hotel->rooms ?? [],
                'reviews'    => $hotel->reviews ?? [],
            ],
        ], 200);
    }

    // Menampilkan daftar hotel milik admin yang sedang login
    public function myHotels(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Hotel::with(['city', 'photos', 'facilities']);

        if ($user->role === 'admin_hotel') {
            $query->where('admin_id', $user->id);
        }

        $hotels = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Data hotel berhasil dimuat',
            'data' => $hotels,
        ], 200);
    }

    // Update profil hotel milik 
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $hotel = Hotel::findOrFail($id);

        // Validasi kepemilikan jika role-nya 
        if ($user->role === 'admin_hotel' && $hotel->admin_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengubah hotel ini.',
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'city_id' => 'required|exists:cities,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'facilities' => 'array', // Array ID fasilitas hotel
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

        // Sync Facilities Pivot
        if ($request->has('facilities')) {
            $hotel->facilities()->sync($request->facilities);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil hotel berhasil diperbarui',
            'data' => $hotel->load(['city', 'facilities', 'photos']),
        ], 200);
    }

    // Upload foto galeri hotel
    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $hotel = Hotel::findOrFail($id);

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'is_thumbnail' => 'boolean',
        ]);

        $path = $request->file('photo')->store('hotels', 'public');

        // Jika diset sebagai thumbnail, ubah thumbnail foto lain jadi false
        if ($request->is_thumbnail) {
            $hotel->photos()->update(['is_thumbnail' => false]);
        }

        $hotelPhoto = $hotel->photos()->create([
            'photo' => $path,
            'is_thumbnail' => $request->is_thumbnail ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil diunggah',
            'data' => $hotelPhoto,
        ], 201);
    }

    // Hapus foto hotel
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