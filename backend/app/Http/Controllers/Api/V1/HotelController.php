<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
     * Menampilkan profil hotel khusus untuk Admin Hotel
     */
    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $hotel = $user->hotel ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $hotel->load(['city', 'facilities', 'photos', 'admin']);

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
            'data'    => [$hotel->load(['city', 'facilities', 'photos', 'admin'])]
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

        $admin = $hotel->admin ?? $user;

        $request->validate([
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'address'      => 'sometimes|string',
            'phone'        => 'nullable|string|max:30',
            'email'        => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin?->id)],
            'city'         => 'nullable|string|max:255',
            'city_id'      => 'nullable|exists:cities,id',
            'banner'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'facilities'   => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
        ]);

        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('hotels/banners', 'public');
            $hotel->banner = asset('storage/' . $path);
        }

        $hotel->update($request->only(['name', 'description', 'address']));

        if ($request->filled('city_id')) {
            $hotel->city_id = $request->city_id;
            $hotel->save();
        } elseif ($request->filled('city')) {
            $cityName = trim($request->city);
            $cleanName = trim(preg_replace('/^(kota|kabupaten)\s+/i', '', $cityName));
            
            $city = City::whereRaw('LOWER(city) = ?', [strtolower($cityName)])
                ->orWhereRaw('LOWER(city) = ?', [strtolower($cleanName)])
                ->orWhere('city', 'like', "%{$cleanName}%")
                ->first();

            if (!$city) {
                $city = City::create([
                    'province' => 'Jawa Barat',
                    'city'     => $cityName,
                ]);
            }

            $hotel->city_id = $city->id;
            $hotel->save();
        }

        if ($admin) {
            $adminData = [];
            if ($request->has('phone')) {
                $adminData['phone'] = $request->phone;
            }
            if ($request->has('email') && !empty($request->email)) {
                $adminData['email'] = $request->email;
            }
            if (!empty($adminData)) {
                $admin->update($adminData);
            }
        }

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
            'data'    => $hotel->fresh(['city', 'facilities', 'photos', 'admin']),
        ], 200);
    }

    /**
     * Upload foto galeri hotel (Storage Lokal)
     */
    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $hotel = Hotel::findOrFail($id);

        $request->validate([
            'photo'        => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_thumbnail' => 'boolean',
        ]);

        $path = $request->file('photo')->store('hotels', 'public');
        $url = asset('storage/' . $path);

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

        if ($photo) {
            if ($photo->photo) {
                app(\App\Services\FileStorageService::class)->deleteFile($photo->photo);
            }
            $photo->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil dihapus'
        ], 200);
    }
}