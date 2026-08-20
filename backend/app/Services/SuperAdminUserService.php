<?php

namespace App\Services;

use App\Models\User;
use App\Models\ActivityLog;
use App\Models\Hotel;
use App\Models\City;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminUserService
{
    /**
     * Mengambil daftar pengguna dengan fitur filter
     */
    public function getUsers(array $filters)
    {
        $query = User::orderBy('created_at', 'desc');

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        // PERBAIKAN: Menggunakan 'per_page' untuk paginasi
        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Membuat akun baru (khususnya Admin Hotel)
     */
    public function createUser(array $data, User $superAdmin): User
    {
        return DB::transaction(function () use ($data, $superAdmin) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'], // Biasanya 'admin_hotel'
                'phone' => $data['phone'] ?? null,
                // PERBAIKAN UTAMA: Menggunakan huruf kecil agar lolos constraint Supabase
                'status' => 'active'
            ]);

            if ($user->role === 'admin_hotel') {
                $hotelName = !empty($data['hotel_name']) ? $data['hotel_name'] : 'Hotel ' . $user->name;
                Hotel::create([
                    'admin_id' => $user->id,
                    'city_id' => City::first()?->id ?? 1,
                    'name' => $hotelName,
                    'slug' => Str::slug($hotelName) . '-' . $user->id,
                    'description' => 'Deskripsi hotel baru untuk ' . $hotelName,
                    'address' => 'Alamat hotel baru',
                    'status' => 'active',
                ]);
            }

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Create User',
                'description' => "Super Admin membuat akun baru dengan email {$user->email} (Role: {$user->role}).",
                'ip_address' => request()->ip()
            ]);

            return $user;
        });
    }

    /**
     * Mengubah status pengguna (Active / Blocked)
     */
    public function updateUserStatus(User $user, string $status, User $superAdmin): void
    {
        DB::transaction(function () use ($user, $status, $superAdmin) {
            $user->update(['status' => $status]);

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Update User Status',
                'description' => "Super Admin mengubah status user {$user->email} menjadi {$status}.",
                'ip_address' => request()->ip()
            ]);
        });
    }

    /**
     * Menghapus akun pengguna
     */
    public function deleteUser(User $user, User $superAdmin): void
    {
        DB::transaction(function () use ($user, $superAdmin) {
            $email = $user->email;
            $user->delete();

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Delete User',
                'description' => "Super Admin menghapus akun dengan email {$email}.",
                'ip_address' => request()->ip()
            ]);
        });
    }
}
