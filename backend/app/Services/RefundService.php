<?php

namespace App\Services;

use App\Models\Refund;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function approveRefund(Refund $refund, User $admin): void
    {
        if ($refund->status !== 'Pending') {
            throw new \Exception('Refund ini sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($refund, $admin) {
            // Update Refund status[cite: 1]
            $refund->update([
                'status' => 'Completed',
                'approved_by' => $admin->id,
                'approved_at' => now()
            ]);

            // Update Booking status menjadi Refunded[cite: 1]
            $refund->booking->update(['status' => 'Refunded']);

            // Kembalikan stok kamar via RoomAvailabilityService[cite: 1]
            app(RoomAvailabilityService::class)->restoreStock($refund->booking);

            // Catat Activity Log[cite: 1]
            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Approve Refund',
                'description' => "Super Admin menyetujui refund untuk Booking {$refund->booking->booking_code}.",
                'ip_address' => request()->ip()
            ]);

            // Kirim Notifikasi ke User[cite: 1]
            Notification::create([
                'user_id' => $refund->requested_by,
                'title' => 'Refund Disetujui',
                'message' => "Pengajuan refund untuk booking {$refund->booking->booking_code} telah disetujui.",
                'type' => 'refund',
                'is_read' => false
            ]);
        });
    }

    public function rejectRefund(Refund $refund, User $admin, string $reason): void
    {
        if ($refund->status !== 'Pending') {
            throw new \Exception('Refund ini sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($refund, $admin, $reason) {
            $refund->update([
                'status' => 'Rejected',
                'approved_by' => $admin->id,
                'approved_at' => now()
            ]);

            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Reject Refund',
                'description' => "Super Admin menolak refund untuk Booking {$refund->booking->booking_code}. Alasan: {$reason}",
                'ip_address' => request()->ip()
            ]);

            Notification::create([
                'user_id' => $refund->requested_by,
                'title' => 'Refund Ditolak',
                'message' => "Pengajuan refund untuk booking {$refund->booking->booking_code} ditolak. Alasan: {$reason}",
                'type' => 'refund',
                'is_read' => false
            ]);
        });
    }
}
