<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\City;
use App\Models\Hotel;
use App\Models\User;
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
                $q->where('name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('email', 'like', '%'.$filters['search'].'%');
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
                'status' => 'active',
            ]);

            if ($user->role === 'admin_hotel') {
                $hotelName = ! empty($data['hotel_name']) ? $data['hotel_name'] : 'Hotel '.$user->name;
                Hotel::create([
                    'admin_id' => $user->id,
                    'city_id' => City::first()?->id ?? 1,
                    'name' => $hotelName,
                    'slug' => Str::slug($hotelName).'-'.$user->id,
                    'description' => 'Deskripsi hotel baru untuk '.$hotelName,
                    'address' => 'Alamat hotel baru',
                    'status' => 'active',
                ]);
            }

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Create User',
                'description' => "Super Admin membuat akun baru dengan email {$user->email} (Role: {$user->role}).",
                'ip_address' => request()->ip(),
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
                'ip_address' => request()->ip(),
            ]);
        });
    }

    /**
     * Mengubah role pengguna
     */
    public function updateUserRole(User $user, string $role, User $superAdmin): void
    {
        DB::transaction(function () use ($user, $role, $superAdmin) {
            $oldRole = $user->role;

            if ($oldRole === 'admin_hotel' && $role !== 'admin_hotel' && $user->hotel) {
                $user->hotel->delete();
            }

            if ($oldRole !== 'admin_hotel' && $role === 'admin_hotel' && ! $user->hotel) {
                $hotelName = 'Hotel '.$user->name;
                Hotel::create([
                    'admin_id' => $user->id,
                    'city_id' => City::first()?->id ?? 1,
                    'name' => $hotelName,
                    'slug' => Str::slug($hotelName).'-'.$user->id,
                    'description' => 'Deskripsi hotel baru untuk '.$hotelName,
                    'address' => 'Alamat hotel baru',
                    'status' => 'active',
                ]);
            }

            $user->update(['role' => $role]);

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Update User Role',
                'description' => "Super Admin mengubah role user {$user->email} dari {$oldRole} menjadi {$role}.",
                'ip_address' => request()->ip(),
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

            // 1. Jika Admin Hotel, hapus hotel dan semua datanya
            if ($user->role === 'admin_hotel') {
                $hotels = Hotel::where('admin_id', $user->id)->get();
                foreach ($hotels as $hotel) {
                    // Hapus data yang memblock (Bookings, dll)
                    $this->cleanupHotelData($hotel);
                    $hotel->forceDelete(); // force delete karena SoftDeletes memblock restrict
                }
            }

            // 2. Hapus data user (Bookings sebagai customer, Notifications, dll)
            $this->cleanupUserData($user);

            $user->delete();

            ActivityLog::create([
                'user_id' => $superAdmin->id,
                'activity' => 'Delete User',
                'description' => "Super Admin menghapus akun dengan email {$email}.",
                'ip_address' => request()->ip(),
            ]);
        });
    }

    /**
     * Membersihkan data hotel sebelum dihapus (untuk melewati constraint restrict)
     */
    private function cleanupHotelData(Hotel $hotel): void
    {
        // Bookings memiliki restrict, harus dihapus manual
        $hotel->bookings()->each(function ($booking) {
            $booking->bookingRooms()->delete();
            $booking->guests()->delete();
            $booking->payment()->delete();
            $booking->eTicket()->delete();
            $booking->review()->delete();
            $booking->statusHistories()->delete();
            $booking->refund()->delete();
            $booking->delete();
        });

        // RoomTypes memiliki cascade delete di level DB, tapi amankan relasi lain
        $hotel->roomTypes()->each(function ($type) {
            $type->availabilities()->delete();
            $type->priceHistories()->delete();
            $type->photos()->delete();
            $type->delete();
        });

        $hotel->photos()->delete();
        $hotel->facilities()->detach();
    }

    /**
     * Membersihkan data user sebelum dihapus
     */
    private function cleanupUserData(User $user): void
    {
        // Hapus bookings di mana user adalah customer
        $user->bookings()->each(function ($booking) {
            $booking->bookingRooms()->delete();
            $booking->guests()->delete();
            $booking->payment()->delete();
            $booking->delete();
        });

        $user->reviews()->delete();
        $user->notifications()->delete();
    }
}
