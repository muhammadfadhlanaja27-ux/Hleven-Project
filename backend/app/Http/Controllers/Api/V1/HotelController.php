<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Services\FileStorageService;
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
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $hotels = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar hotel berhasil dimuat',
            'data' => $hotels,
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
            'roomTypes.facilities',
        ])->find($id);

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail hotel berhasil dimuat',
            'data' => $hotel,
        ], 200);
    }

    /**
     * Menampilkan profil hotel khusus untuk Admin Hotel
     */
    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $hotel->load(['city', 'facilities', 'photos', 'admin']);

        return response()->json([
            'success' => true,
            'message' => 'Profil hotel berhasil dimuat',
            'data' => $hotel,
        ], 200);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $fileStorage = app(FileStorageService::class);
        $previousLogo = $hotel->logo;
        $hotel->logo = $fileStorage->uploadFile($request->file('logo'), "hotels/{$hotel->id}/logo");
        $hotel->save();

        if ($previousLogo && $previousLogo !== $hotel->logo) {
            $fileStorage->deleteFile($previousLogo);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logo hotel berhasil diperbarui.',
            'data' => ['logo' => $hotel->logo],
        ], 201);
    }

    public function deleteLogo(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        if ($hotel->logo) {
            app(FileStorageService::class)->deleteFile($hotel->logo);
            $hotel->logo = null;
            $hotel->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logo hotel berhasil dihapus.',
            'data' => ['logo' => null],
        ]);
    }

    /**
     * Mengambil daftar hotel milik admin yang sedang login
     */
    public function myHotels(Request $request): JsonResponse
    {
        $user = $request->user();

        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data hotel berhasil diambil',
            'data' => [$hotel->load(['city', 'facilities', 'photos', 'admin'])],
        ], 200);
    }

    /**
     * Memperbarui profil hotel (Admin Hotel)
     */
    public function update(Request $request, $id = null): JsonResponse
    {
        $user = $request->user();

        $ownedHotelIds = array_map('intval', array_filter(array_merge(
            [$user->hotel?->id],
            $user->hotels->pluck('id')->all()
        )));

        if ($id && ! in_array((int) $id, $ownedHotelIds, true)) {
            return response()->json(['success' => false, 'message' => 'Anda tidak berhak mengakses hotel ini.'], 403);
        }

        $hotel = $id ? Hotel::find($id) : ($user->hotel ?? $user->hotels()->first());

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found.'], 404);
        }

        $admin = $hotel->admin ?? $user;

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'address' => 'sometimes|string',
            'policies' => 'nullable|string|max:5000',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin?->id)],
            'city' => 'nullable|string|max:255',
            'city_id' => 'nullable|exists:cities,id',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'facilities' => 'nullable|array',
            'facilities.*' => [Rule::exists('facilities', 'id')->where(fn ($q) => $q->where('hotel_id', $hotel->id)->orWhereNull('hotel_id'))],
        ]);

        if ($request->hasFile('banner')) {
            if ($hotel->banner) {
                app(FileStorageService::class)->deleteFile($hotel->banner);
            }
            $hotel->banner = app(FileStorageService::class)->uploadFile($request->file('banner'), 'hotels/banners');
        }

        $hotel->update($request->only([
            'name', 'description', 'address', 'policies',
            'bank_name', 'bank_account_number', 'bank_account_name',
        ]));

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

            if (! $city) {
                $city = City::create([
                    'province' => 'Jawa Barat',
                    'city' => $cityName,
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
            if ($request->has('email') && ! empty($request->email)) {
                $adminData['email'] = $request->email;
            }
            if (! empty($adminData)) {
                $admin->update($adminData);
            }
        }

        if ($request->has('facilities')) {
            $facilities = $request->input('facilities');
            if (is_array($facilities)) {
                $hotel->facilities()->sync(array_filter($facilities, fn ($v) => is_numeric($v)));
            } else {
                $hotel->facilities()->sync([]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil hotel berhasil diperbarui',
            'data' => $hotel->fresh(['city', 'facilities', 'photos', 'admin']),
        ], 200);
    }

    /**
     * Upload foto galeri hotel (Storage Lokal)
     */
    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $ownedHotelIds = array_map('intval', array_filter(array_merge(
            [$user->hotel?->id],
            $user->hotels->pluck('id')->all()
        )));

        if (! in_array((int) $id, $ownedHotelIds, true)) {
            return response()->json(['success' => false, 'message' => 'Anda tidak berhak mengakses hotel ini.'], 403);
        }

        $hotel = Hotel::findOrFail($id);

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_thumbnail' => 'boolean',
        ]);

        $url = app(FileStorageService::class)->uploadFile($request->file('photo'), 'hotels');

        if ($request->is_thumbnail) {
            $hotel->photos()->update(['is_thumbnail' => false]);
        }

        $hotelPhoto = $hotel->photos()->create([
            'photo' => $url,
            'is_thumbnail' => $request->is_thumbnail ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil diunggah',
            'data' => $hotelPhoto,
        ], 201);
    }

    /**
     * Hapus foto galeri hotel (Support 1 parameter photoId atau 2 parameter hotelId & photoId)
     */
    public function deletePhoto(Request $request, $param1, $param2 = null): JsonResponse
    {
        $photoId = $param2 !== null ? $param2 : $param1;
        $photo = HotelPhoto::with('hotel')->find($photoId);

        if (! $photo) {
            return response()->json([
                'success' => false,
                'message' => 'Foto hotel tidak ditemukan',
            ], 404);
        }

        $user = $request->user();
        $ownedHotelIds = array_map('intval', array_filter(array_merge(
            [$user->hotel?->id],
            $user->hotels->pluck('id')->all()
        )));

        if (! in_array((int) $photo->hotel_id, $ownedHotelIds, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak berhak menghapus foto ini.',
            ], 403);
        }

        if ($photo->photo) {
            app(FileStorageService::class)->deleteFile($photo->photo);
        }
        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto hotel berhasil dihapus',
        ], 200);
    }
}
