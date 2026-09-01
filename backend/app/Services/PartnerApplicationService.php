<?php

namespace App\Services;

use App\Models\PartnerApplication;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\Hotel;
use App\Models\City;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PartnerApplicationService
{
    public function approveApplication(PartnerApplication $application, User $admin): void
    {
        DB::transaction(function () use ($application, $admin) {
            $application->update(['status' => 'approved']);

            $adminEmail = $application->hotel_email;
            $ownerName = $application->owner_name;
            $ownerPhone = $application->owner_phone ?: $application->phone;

            $generatedPassword = null;
            $hotelAdmin = null;

            $applicant = $application->user_id ? User::find($application->user_id) : null;

            if ($applicant && strtolower($applicant->email) === strtolower($adminEmail)) {
                $applicant->update([
                    'role' => 'admin_hotel',
                    'status' => 'active',
                    'phone' => $applicant->phone ?: $ownerPhone,
                ]);
                $hotelAdmin = $applicant;
            } else {
                $existingUser = User::where('email', $adminEmail)->first();
                if ($existingUser) {
                    $existingUser->update([
                        'role' => 'admin_hotel',
                        'status' => 'active',
                        'phone' => $existingUser->phone ?: $ownerPhone,
                    ]);
                    $hotelAdmin = $existingUser;
                } else {
                    $generatedPassword = Str::random(10);
                    $hotelAdmin = User::create([
                        'name' => $ownerName,
                        'email' => $adminEmail,
                        'password' => Hash::make($generatedPassword),
                        'role' => 'admin_hotel',
                        'status' => 'active',
                        'phone' => $ownerPhone,
                    ]);
                }
            }

            $city = null;
            if (!empty($application->city)) {
                $city = City::whereRaw('LOWER(city) = ?', [strtolower($application->city)])->first();
                if (!$city) {
                    $city = City::create([
                        'city' => $application->city,
                        'province' => $application->province ?: 'Provinsi belum diisi',
                    ]);
                }
            }
            if (!$city) {
                $city = City::first();
                if (!$city) {
                    $city = City::create([
                        'city' => $application->city ?: 'Kota Belum Ditentukan',
                        'province' => $application->province ?: 'Provinsi Belum Ditentukan',
                    ]);
                }
            }

            $addressParts = array_filter([
                $application->address,
                $application->district,
                $application->city,
                $application->province,
                $application->postal_code,
            ]);
            $fullAddress = implode(', ', $addressParts) ?: 'Alamat belum diisi';

            $slugBase = Str::slug($application->hotel_name ?: 'hotel-' . $application->id);
            $slug = $slugBase . '-' . $hotelAdmin->id;
            $counter = 1;
            while (Hotel::where('slug', $slug)->exists()) {
                $slug = $slugBase . '-' . $hotelAdmin->id . '-' . $counter;
                $counter++;
            }

            Hotel::create([
                'admin_id' => $hotelAdmin->id,
                'city_id' => $city->id,
                'name' => $application->hotel_name,
                'slug' => $slug,
                'description' => $application->hotel_description ?: 'Deskripsi hotel untuk ' . $application->hotel_name,
                'address' => $fullAddress,
                'latitude' => $application->latitude ?: null,
                'longitude' => $application->longitude ?: null,
                'status' => 'active',
                'average_rating' => 0,
                'total_review' => 0,
            ]);

            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Approve Partner',
                'description' => "Super Admin menyetujui partner {$application->hotel_name} (App No: {$application->application_number}).",
                'ip_address' => request()->ip()
            ]);

            if ($applicant && $hotelAdmin->id === $applicant->id) {
                $message = "Pengajuan mitra hotel {$application->hotel_name} berhasil disetujui. Akun Anda telah diupgrade menjadi admin hotel. Silakan login dengan email: {$adminEmail}.";
            } elseif ($generatedPassword) {
                $message = "Pengajuan mitra hotel {$application->hotel_name} berhasil disetujui. Akun admin hotel telah dibuat. Email: {$adminEmail}. Password: {$generatedPassword}. Silakan login dan segera ubah kata sandi Anda.";
            } else {
                $message = "Pengajuan mitra hotel {$application->hotel_name} berhasil disetujui. Akun admin hotel telah dibuat dengan email: {$adminEmail}.";
            }

            Notification::create([
                'user_id' => $hotelAdmin->id,
                'title' => 'Pengajuan Mitra Berhasil',
                'message' => $message,
                'type' => 'partner_approved',
            ]);
        });
    }

    public function rejectApplication(PartnerApplication $application, User $admin, string $reason): void
    {
        DB::transaction(function () use ($application, $admin, $reason) {
            $application->update([
                'status' => 'rejected',
                'rejection_reason' => $application->rejection_reason ?: $reason,
            ]);

            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Reject Partner',
                'description' => "Super Admin menolak partner {$application->hotel_name}. Alasan: {$reason}",
                'ip_address' => request()->ip()
            ]);
        });
    }
}
