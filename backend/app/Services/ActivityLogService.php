<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogService
{
    /**
     * Mengambil daftar activity log dengan filter dan otorisasi[cite: 1]
     */
    public function getLogs(User $user, array $filters)
    {
        $query = ActivityLog::with('user:id,name')->orderBy('created_at', 'desc');

        // Aturan ACTIVITY-006: Admin Hotel hanya melihat aktivitasnya sendiri (hotel yang dikelolanya)[cite: 1]
        if ($user->role === 'admin_hotel') {
            $query->where('user_id', $user->id);
        } else {
            // Super admin dapat melakukan filter berdasarkan user_id tertentu[cite: 1]
            if (isset($filters['user_id'])) {
                $query->where('user_id', $filters['user_id']);
            }
        }

        // Filter berdasarkan jenis aktivitas[cite: 1]
        if (isset($filters['activity'])) {
            $query->where('activity', 'like', '%' . $filters['activity'] . '%');
        }

        // Filter berdasarkan rentang tanggal[cite: 1]
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('created_at', [
                $filters['start_date'] . ' 00:00:00',
                $filters['end_date'] . ' 23:59:59'
            ]);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }
}
