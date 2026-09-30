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
                'status' => 'unread'
            ]);

            Notification::create([
                'user_id' => $hotel->admin_id,
                'title' => 'Peringatan Baru: ' . $warning->title,
                'message' => $warning->message,
                'type' => 'warning',
                'is_read' => false
            ]);

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Create Warning',
                'description' => "Super Admin memberikan warning kepada hotel {$hotel->name}.",
                'ip_address' => request()->ip()
            ]);

            $activeWarnings = Warning::where('hotel_id', $hotel->id)->whereIn('status', ['unread', 'pending'])->count();
            if ($activeWarnings >= 2 && $hotel->status !== 'blocked') {
                $hotel->update(['status' => 'blocked']);
                Notification::create([
                    'user_id' => $hotel->admin_id,
                    'title' => 'Hotel Diblokir Otomatis',
                    'message' => "Hotel {$hotel->name} otomatis diblokir karena telah menerima {$activeWarnings} peringatan.",
                    'type' => 'warning',
                    'is_read' => false
                ]);
                ActivityLog::create([
                    'user_id' => $superAdmin->id,
                    'activity' => 'Auto Suspend Hotel',
                    'description' => "Hotel {$hotel->name} otomatis diblokir setelah {$activeWarnings} peringatan.",
                    'ip_address' => request()->ip()
                ]);
            }

            return $warning->fresh();
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
