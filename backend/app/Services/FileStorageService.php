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
    /**
     * Mengunggah file ke direktori tertentu dan mengembalikan path[cite: 1]
     */
    protected function buildPublicUrl(string $path): string
    {
        $baseUrl = trim((string) config('filesystems.disks.s3.url'));
        $path = ltrim($path, '/');

        if ($baseUrl !== '') {
            return rtrim($baseUrl, '/') . '/' . $path;
        }

        $bucket = trim((string) config('filesystems.disks.s3.bucket'));
        $endpoint = trim((string) config('filesystems.disks.s3.endpoint'));

        if ($bucket !== '' && $endpoint !== '') {
            return rtrim($endpoint, '/') . '/' . $bucket . '/' . $path;
        }

        return url('/storage/' . $path);
    }

    public function uploadFile(UploadedFile $file, string $directory): string
    {
        // Menyimpan file secara otomatis menggunakan hash name bawaan Laravel
        $storedPath = $file->store($directory, 's3');

        return $this->buildPublicUrl($storedPath);
    }

    protected function normalizeStoragePath(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH) ?? $url;
        $path = ltrim($path, '/');

        $bucket = trim((string) config('filesystems.disks.s3.bucket'));
        if ($bucket !== '' && str_starts_with($path, $bucket . '/')) {
            $path = substr($path, strlen($bucket) + 1);
        }

        if (preg_match('#^(?:storage(?:/v1)?/)?(?:object/)?(?:public/)?(.+)$#i', $path, $matches)) {
            $path = $matches[1];
        }

        if ($bucket !== '' && str_starts_with($path, $bucket . '/')) {
            $path = substr($path, strlen($bucket) + 1);
        }

        return ltrim($path, '/');
    }

    /**
     * Menghapus file fisik dari storage[cite: 1]
     */
    public function deleteFile(?string $url): void
    {
        if (!$url) return;

        try {
            $path = $this->normalizeStoragePath($url);

            if ($path && Storage::disk('s3')->exists($path)) {
                Storage::disk('s3')->delete($path);
            }
        } catch (\Throwable $e) {
            // Jangan mematikan request ketika file lama sudah rusak atau path storage tidak valid.
            return;
        }
    }

    public function storeHotelPhoto($hotelId, UploadedFile $file, bool $isThumbnail): void
    {
        $path = $this->uploadFile($file, "hotel/{$hotelId}");

        // Jika menjadi thumbnail, reset thumbnail foto lain terlebih dahulu
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
        // Hapus avatar lama jika ada
        if ($user->avatar) {
            $this->deleteFile($user->avatar);
        }

        $path = $this->uploadFile($file, "avatar/{$user->id}");
        $user->update(['avatar' => $path]);
    }
}
