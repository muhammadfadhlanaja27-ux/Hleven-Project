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
    public function uploadFile(UploadedFile $file, string $directory): string
    {
        // Menyimpan file secara otomatis menggunakan hash name bawaan Laravel
        return Storage::disk('s3')->url($file->store($directory, 's3'));
    }

    /**
     * Menghapus file fisik dari storage[cite: 1]
     */
    public function deleteFile(?string $url): void
    {
        if (!$url) return;
        
        // Cek apakah URL adalah path relatif (lokal storage) atau full URL
        if (str_starts_with($url, 'http')) {
            $path = parse_url($url, PHP_URL_PATH);
            // Hapus leading slash jika ada agar menjadi path relatif
            $path = ltrim($path, '/');
            // Jika ada prefix 'storage/', biasanya Laravel butuh path asli
            $path = str_replace('storage/', '', $path);
        } else {
            $path = $url;
        }

        if ($path && Storage::disk('s3')->exists($path)) {
            Storage::disk('s3')->delete($path);
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
