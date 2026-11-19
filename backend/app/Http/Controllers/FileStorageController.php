<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileStorageController extends Controller
{
    protected FileStorageService $storageService;

    public function __construct(FileStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
 * Mengunggah foto hotel.
 *
 * Proses unggah foto baru untuk hotel tertentu.
 * Validasi meliputi tipe file (jpg, jpeg, png, webp), maksimal 5MB,
 * dan validasi kepemilikan hotel oleh admin yang login.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID hotel
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses unggahan foto
     */
    public function uploadHotelPhoto(Request $request, $id): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120', // Max 5MB[cite: 1]
            'is_thumbnail' => 'boolean',
        ]);

        try {
            $hotel = Hotel::findOrFail($id);

            // Validasi kepemilikan hotel[cite: 1]
            if ($hotel->admin_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            $isThumbnail = $request->input('is_thumbnail', false);
            $this->storageService->storeHotelPhoto($hotel->id, $request->file('photo'), $isThumbnail);

            return response()->json([
                'success' => true,
                'message' => 'Foto hotel berhasil diunggah.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah foto hotel.',
            ], 500);
        }
    }

    /**
 * Menghapus foto hotel.
 *
 * Proses penghapusan foto hotel yang sudah ada.
 * Validasi kepemilikan hotel oleh admin yang login serta aturan
 * minim satu foto untuk hotel ($photoCount <= 1).
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID foto hotel
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penghapusan
     */
    public function deleteHotelPhoto(Request $request, $id): JsonResponse
    {
        try {
            $photo = HotelPhoto::with('hotel')->findOrFail($id);

            if ($photo->hotel->admin_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            // Aturan HOTEL-003: Hotel wajib memiliki minimal satu foto[cite: 1]
            $photoCount = HotelPhoto::where('hotel_id', $photo->hotel_id)->count();
            if ($photoCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hotel harus tetap memiliki minimal satu foto.',
                ], 400);
            }

            $this->storageService->removeHotelPhoto($photo);

            return response()->json([
                'success' => true,
                'message' => 'Foto hotel berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus foto.',
            ], 500);
        }
    }

    /**
 * Mengunggah foto kamar.
 *
 * Proses unggah foto baru untuk tipe kamar tertentu.
 * Validasi meliputi tipe file (jpg, jpeg, png, webp), maksimal 5MB,
 * serta validasi akses hotel berdasarkan admin_id.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID tipe kamar (room_type_id)
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses unggahan foto
     */
    public function uploadRoomPhoto(Request $request, $id): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'is_thumbnail' => 'boolean',
        ]);

        try {
            $room = RoomType::with('hotel')->findOrFail($id);

            if ($room->hotel && $room->hotel->admin_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            $isThumbnail = $request->input('is_thumbnail', false);
            $this->storageService->storeRoomPhoto($room->id, $request->file('photo'), $isThumbnail);

            return response()->json([
                'success' => true,
                'message' => 'Foto kamar berhasil diunggah.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah foto kamar: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
 * Menghapus foto kamar.
 *
 * Proses penghapusan foto kamar yang sudah ada.
 * Validasi akses hotel berdasarkan roomType.hotel.admin_id serta
 * penghapusan melalui storage service.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $id ID foto kamar (room_photo_id)
 * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penghapusan
     */
    public function deleteRoomPhoto(Request $request, $id): JsonResponse
    {
        try {
            $photo = RoomPhoto::with('roomType.hotel')->find($id);

            if (! $photo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Foto kamar tidak ditemukan.',
                ], 404);
            }

            if ($photo->roomType && $photo->roomType->hotel && $photo->roomType->hotel->admin_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }

            $this->storageService->removeRoomPhoto($photo);

            return response()->json([
                'success' => true,
                'message' => 'Foto kamar berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus foto kamar: '.$e->getMessage(),
            ], 500);
        }
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        try {
            $this->storageService->updateAvatar($request->user(), $request->file('avatar'));

            return response()->json([
                'success' => true,
                'message' => 'Avatar berhasil diperbarui.',
                'data' => $request->user()->fresh(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah avatar: '.$e->getMessage(),
            ], 500);
        }
    }
}
