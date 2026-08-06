<?php

namespace App\Services;

use App\Models\Warning;
use App\Models\Hotel;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class WarningService
{
    /**
     * Mengambil daftar warning sesuai role pengguna[cite: 1]
     */
    public function getWarnings($user, array $filters)
    {
        $query = Warning::with('hotel');

        // Jika yang login adalah Admin Hotel, filter berdasarkan hotel miliknya[cite: 1]
        if ($user->role === 'admin_hotel') {
            $hotelIds = Hotel::where('admin_id', $user->id)->pluck('id');
            $query->whereIn('hotel_id', $hotelIds);
        } elseif (isset($filters['hotel_id'])) {
            $query->where('hotel_id', $filters['hotel_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['page'] ?? 10);
    }

    /**
     * Membuat warning baru[cite: 1]
     */
    public function createWarning(array $data, $superAdmin): Warning
    {
        return DB::transaction(function () use ($data, $superAdmin) {
            $hotel = Hotel::findOrFail($data['hotel_id']);

            $warning = Warning::create([
                'hotel_id' => $hotel->id,
                'super_admin_id' => $superAdmin->id,
                'title' => $data['title'],
                'message' => $data['message'],
                'status' => 'pending' // Status awal adalah pending[cite: 1]
            ]);

            // Kirim notifikasi ke Admin Hotel[cite: 1]
            Notification::create([
                'user_id' => $hotel->admin_id,
                'title' => 'Peringatan Baru: ' . $warning->title,
                'message' => $warning->message,
                'type' => 'warning',
                'is_read' => false
            ]);

            // Catat log aktivitas[cite: 1]
            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Create Warning',
                'description' => "Super Admin memberikan warning kepada hotel {$hotel->name}.",
                'ip_address' => request()->ip()
            ]);

            return $warning;
        });
    }

    /**
     * Mengubah status warning menjadi resolved[cite: 1]
     */
    public function updateStatus(Warning $warning, string $status, $superAdmin): void
    {
        DB::transaction(function () use ($warning, $status, $superAdmin) {
            $warning->update(['status' => $status]);

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Update Warning Status',
                'description' => "Super Admin mengubah status warning ID {$warning->id} menjadi {$status}.",
                'ip_address' => request()->ip()
            ]);
        });
    }

    /**
     * Menghapus warning[cite: 1]
     */
    public function deleteWarning(Warning $warning, $superAdmin): void
    {
        DB::transaction(function () use ($warning, $superAdmin) {
            $warningId = $warning->id;
            $warning->delete();

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Delete Warning',
                'description' => "Super Admin menghapus warning ID {$warningId}.",
                'ip_address' => request()->ip()
            ]);
        });
    }
}
