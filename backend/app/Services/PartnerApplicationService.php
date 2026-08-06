<?php

namespace App\Services;

use App\Models\PartnerApplication;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PartnerApplicationService
{
    public function approveApplication(PartnerApplication $application, User $admin): void
    {
        DB::transaction(function () use ($application, $admin) {
            // Ubah status menjadi Approved[cite: 1]
            $application->update(['status' => 'Approved']);

            // Buat akun Admin Hotel secara otomatis (Opsional sesuai alur PARTNER-006)[cite: 1]
            $password = Str::random(10); // Generate random password, bisa dikirim via email nantinya
            $hotelAdmin = User::create([
                'name' => $application->owner_name,
                'email' => $application->email,
                'password' => Hash::make($password),
                'role' => 'admin_hotel',
                'status' => 'Active',
                'phone' => $application->phone
            ]);

            // Catat Activity Log[cite: 1]
            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Approve Partner',
                'description' => "Super Admin menyetujui partner {$application->hotel_name}.",
                'ip_address' => request()->ip()
            ]);

            // TODO: Integrasi pengiriman email kredensial (password) ke pemilik hotel via Queue (Checkpoint 2)[cite: 1]
        });
    }

    public function rejectApplication(PartnerApplication $application, User $admin, string $reason): void
    {
        DB::transaction(function () use ($application, $admin, $reason) {
            $application->update(['status' => 'Rejected']);

            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Reject Partner',
                'description' => "Super Admin menolak partner {$application->hotel_name}. Alasan: {$reason}",
                'ip_address' => request()->ip()
            ]);

            // TODO: Integrasi pengiriman email penolakan (Checkpoint 2)[cite: 1]
        });
    }
}
