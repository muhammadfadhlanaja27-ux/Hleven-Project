<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class RoomPhotoController extends Controller
{
    /**
     * Hapus foto spesifik dari kamar
     */
    public function destroy($id): JsonResponse
    {
        $photo = RoomPhoto::find($id);

        if (! $photo) {
            return response()->json([
                'success' => false,
                'message' => 'Foto kamar tidak ditemukan',
            ], 404);
        }

        if ($photo->photo) {
            $relativePath = str_replace(asset('storage/'), '', $photo->photo);
            Storage::disk('public')->delete(ltrim($relativePath, '/'));
        }

        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto kamar berhasil dihapus',
        ], 200);
    }
}