<?php

namespace App\Services;

use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class FileStorageService
{
    public function uploadFile(UploadedFile $file, string $directory): string
    {
        $storedPath = $file->store($directory, 'public');

        return Storage::disk('public')->url($storedPath);
    }

    protected function normalizeStoragePath(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        // Ambil path dari URL (misal: /storage/hotel/1/foto.jpg)
        $path = parse_url($url, PHP_URL_PATH);
        
        // Hapus prefix '/storage/' atau 'storage/'
        if (str_starts_with($path, '/storage/')) {
            $path = substr($path, 9);
        } elseif (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }

        return ltrim($path, '/');
    }

    public function deleteFile(?string $url): void
    {
        if (!$url) return;

        try {
            $path = $this->normalizeStoragePath($url);

            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        } catch (\Throwable $e) {
            return;
        }
    }

    public function storeHotelPhoto($hotelId, UploadedFile $file, bool $isThumbnail): void
    {
        $path = $this->uploadFile($file, "hotel/{$hotelId}");

        if ($isThumbnail) {
            HotelPhoto::where('hotel_id', $hotelId)->update(['is_thumbnail' => false]);
        }

        HotelPhoto::create([
            'hotel_id' => $hotelId,
            'photo' => $path,
            'is_thumbnail' => $isThumbnail
        ]);
    }

    public function removeHotelPhoto(HotelPhoto $photo): void
    {
        DB::transaction(function () use ($photo) {
            $this->deleteFile($photo->photo);
            $photo->delete();
        });
    }

    public function storeRoomPhoto($roomId, UploadedFile $file, bool $isThumbnail): void
    {
        $path = $this->uploadFile($file, "room/{$roomId}");

        if ($isThumbnail) {
            RoomPhoto::where('room_type_id', $roomId)->update(['is_thumbnail' => false]);
        }

        RoomPhoto::create([
            'room_type_id' => $roomId,
            'photo' => $path,
            'is_thumbnail' => $isThumbnail
        ]);
    }

    public function removeRoomPhoto(RoomPhoto $photo): void
    {
        DB::transaction(function () use ($photo) {
            $this->deleteFile($photo->photo);
            $photo->delete();
        });
    }

    public function updateAvatar(User $user, UploadedFile $file): void
    {
        if ($user->avatar) {
            $this->deleteFile($user->avatar);
        }

        $path = $this->uploadFile($file, "avatar/{$user->id}");
        $user->update(['avatar' => $path]);
    }
}