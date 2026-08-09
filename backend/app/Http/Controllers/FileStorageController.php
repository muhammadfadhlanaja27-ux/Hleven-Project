<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\User;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;

class FileStorageController extends Controller
{
    protected FileStorageService $storageService;

    public function __construct(FileStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    public function uploadHotelPhoto(Request $request, $id): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120', // Max 5MB[cite: 1]
            'is_thumbnail' => 'boolean'
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
                'message' => 'Foto hotel berhasil diunggah.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah foto hotel.'
            ], 500);
        }
    }

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
                    'message' => 'Hotel harus tetap memiliki minimal satu foto.'
                ], 400);
            }

            $this->storageService->removeHotelPhoto($photo);

            return response()->json([
                'success' => true,
                'message' => 'Foto hotel berhasil dihapus.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus foto.'
            ], 500);
        }
    }

    // Catatan: Fungsi uploadRoomPhoto, deleteRoomPhoto, dan uploadAvatar menggunakan logika validasi dan try-catch yang serupa.
}
