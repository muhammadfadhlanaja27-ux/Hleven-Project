<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Mengambil daftar notifikasi milik pengguna dengan filter[cite: 1]
     */
    public function getNotifications(User $user, array $filters)
    {
        $query = Notification::where('user_id', $user->id)->orderBy('created_at', 'desc');

        if (isset($filters['is_read'])) {
            $isRead = filter_var($filters['is_read'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_read', $isRead);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['page'] ?? 10);
    }

    /**
     * Menandai satu notifikasi sebagai telah dibaca[cite: 1]
     */
    public function markAsRead(Notification $notification): void
    {
        if (!$notification->is_read) {
            $notification->update(['is_read' => true]);
        }
    }

    /**
     * Menandai seluruh notifikasi milik pengguna sebagai telah dibaca[cite: 1]
     */
    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Menghapus notifikasi[cite: 1]
     */
    public function deleteNotification(Notification $notification): void
    {
        $notification->delete();
    }
}
