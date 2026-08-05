<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]
            ->forgetCachedPermissions();

        $permissions = [

            // User
            'user.view',
            'user.create',
            'user.update',
            'user.delete',

            // Hotel
            'hotel.view',
            'hotel.create',
            'hotel.update',
            'hotel.delete',

            // Room
            'room.view',
            'room.create',
            'room.update',
            'room.delete',

            // Facility
            'facility.view',
            'facility.create',
            'facility.update',
            'facility.delete',

            // Booking
            'booking.view',
            'booking.create',
            'booking.update',
            'booking.delete',

            // Review
            'review.view',
            'review.delete',

            // Dashboard
            'dashboard.view',

            // Partner
            'partner.view',
            'partner.approve',
            'partner.reject',

            // Warning
            'warning.view',
            'warning.create',
            'warning.update',
            'warning.delete',

            // Notification
            'notification.view',

            // Activity Log
            'activity.view',

            // Payment
            'payment.view',

        ];

        foreach ($permissions as $permission) {

            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum',
            ]);

        }

        $superAdmin = Role::findByName('super_admin', 'sanctum');
        $adminHotel = Role::findByName('admin_hotel', 'sanctum');
        $user = Role::findByName('user', 'sanctum');

        // Super Admin memiliki semua permission
        $superAdmin->syncPermissions(Permission::all());

        // Admin Hotel
        $adminHotel->syncPermissions([

            'dashboard.view',

            'hotel.view',
            'hotel.create',
            'hotel.update',

            'room.view',
            'room.create',
            'room.update',

            'facility.view',

            'booking.view',
            'booking.update',

            'review.view',

            'notification.view',

        ]);

        // User
        $user->syncPermissions([

            'booking.create',
            'booking.view',

            'review.view',

            'dashboard.view',

        ]);
    }
}