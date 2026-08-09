<?php

namespace App\Services;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperAdminUserService
{
    /**
     * Mengambil daftar pengguna dengan fitur filter[cite: 1]
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

        return $query->paginate($filters['page'] ?? 10);
    }

    /**
     * Membuat akun baru (khususnya Admin Hotel)[cite: 1]
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
                'status' => 'Active'
            ]);

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
     * Mengubah status pengguna (Active / Blocked)[cite: 1]
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
     * Menghapus akun pengguna[cite: 1]
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
