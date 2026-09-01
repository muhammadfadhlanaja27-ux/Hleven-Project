<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\HotelPhoto;
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
        $query = Hotel::with(['city', 'photos', 'facilities', 'roomTypes'])
            ->where('status', 'active');

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
            'roomTypes.photos', 
            'roomTypes.facilities'
        ])->find($id);

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail hotel berhasil dimuat',
            'data'    => $hotel,
        ], 200);
    }

    /**
     * Menampilkan profil hotel khusus untuk Admin Hotel (Update: Fallback ke hotel pertama)
     */
    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Coba ambil melalui relasi user->hotel, jika null ambil hotel pertama di database (untuk single-hotel system)
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
        
        // Coba ambil melalui relasi user->hotel, jika null ambil hotel pertama di database
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
            if ($hotel->banner) {
                $oldPath = parse_url($hotel->banner, PHP_URL_PATH);
                $oldPath = ltrim($oldPath, '/');
                if (Storage::disk('s3')->exists($oldPath)) {
                    Storage::disk('s3')->delete($oldPath);
                }
            }
            $path = $request->file('banner')->store('hotels/banners', 's3');
            $hotel->banner = Storage::disk('s3')->url($path);
        }

        $hotel->update($request->only(['name', 'description', 'address', 'phone']));

        if ($request->has('facilities')) {
            $facilities = $request->input('facilities');
            if (is_array($facilities)) {
                $hotel->facilities()->sync(array_filter($facilities, fn($v) => is_numeric($v)));
            } else {
                $hotel->facilities()->sync([]);
            }
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
            'photo'        => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_thumbnail' => 'boolean',
        ]);

        $path = $request->file('photo')->store('hotels', 's3');
        $url = Storage::disk('s3')->url($path);

        if ($request->is_thumbnail) {
            $hotel->photos()->update(['is_thumbnail' => false]);
        }

        $hotelPhoto = $hotel->photos()->create([
            'photo'        => $url,
            'is_thumbnail' => $request->is_thumbnail ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil diunggah',
            'data'    => $hotelPhoto,
        ], 201);
    }

    /**
     * Hapus foto galeri hotel (Support 1 parameter photoId atau 2 parameter hotelId & photoId)
     */
    public function deletePhoto(Request $request, $param1, $param2 = null): JsonResponse
    {
        $photoId = $param2 !== null ? $param2 : $param1;

        $photo = HotelPhoto::find($photoId);

        if (!$photo) {
            return response()->json([
                'success' => false,
                'message' => 'Foto tidak ditemukan'
            ], 404);
        }

        // Hapus file dari S3 / Supabase Storage jika file ada
        $filePath = $photo->photo ?? $photo->image_path ?? null;
        if ($filePath) {
            $parsedPath = parse_url($filePath, PHP_URL_PATH);
            $cleanPath = ltrim($parsedPath, '/');

            // Hapus prefix nama bucket jika terikut di path URL
            $bucket = config('filesystems.disks.s3.bucket');
            if ($bucket && str_starts_with($cleanPath, $bucket . '/')) {
                $cleanPath = substr($cleanPath, strlen($bucket) + 1);
            }

            if (Storage::disk('s3')->exists($cleanPath)) {
                Storage::disk('s3')->delete($cleanPath);
            }
        }

        // Hapus data dari PostgreSQL
        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil dihapus'
        ], 200);
    }
}