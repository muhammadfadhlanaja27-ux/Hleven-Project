<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PurgeDummyHotels extends Command
{
    protected $signature = 'dummy:purge-hotels {--force : Skip confirmation}';

    protected $description = 'Hapus data dummy hotel (hotel01..hotel20@hleven.com, [DUMMY] hotels)';

    /**
     * Execute the console command.
     *
     * Menghapus data hotel dummy (hotel01..hotel20@hleven.com, [DUMMY] hotels)
     * beserta data terkait dalam transaksi database.
     *
     * Fitur:
     * - Opsi --force untuk skip konfirmasi manual
     * - Validasi data dummy sebelum penghapusan (cek jumlah hotel dan user)
     * - Penghapusan berurutan: bookings -> room types -> photos -> hotels -> users
     * - Cleanup tabel hub: booking_status_histories, guests, payments, refunds, reviews, e_tickets
     * - Gunakan DB::transaction untuk keconsistenan data jika ada gagal
     *
     * @param bool $force - Dari opsi --force command (skip konfirmasi)
     * @return int - SUCCESS (0) atau kode error
     */
    public function handle(): int
    {
        $hotelCount = Hotel::where('slug', 'like', '%-dummy-%')->count();
        if ($hotelCount === 0) {
            $hotelCount = Hotel::where('name', 'like', '[DUMMY]%')->count();
        }
        $userCount = User::where('email', 'like', 'hotel%@hleven.com')
            ->where('email', 'regexp', '^hotel[0-9]{2}@hleven\\.com$')
            ->count();

        if ($hotelCount === 0 && $userCount === 0) {
            $this->info('Tidak ada data dummy ditemukan.');

            return self::SUCCESS;
        }

        $this->warn("Akan menghapus: {$hotelCount} hotel dummy, {$userCount} user dummy.");

        if (! $this->option('force') && ! $this->confirm('Lanjutkan hapus data dummy?')) {
            $this->info('Dibatalkan.');

            return self::SUCCESS;
        }

        /**
         * Semua penghapusan data dijalankan dalam transaksi database
         * untuk memastikan keconsistenan jika ada bagian gagal.
         * Urutan penghapusan:
         * 1. Hapus data terkait: booking_status_histories, guests, payments, refunds, reviews, e_tickets
         * 2. Hapus booking_room dan booking
         * 3. Hapus room_availabilities dan room_price_histories
         * 4. Hapus room_photo, room_facilities
         * 5. Force delete room_type
         * 6. Hapus hotel_photo, hotel_facilities
         * 7. Force delete hotel
         * 8. Delete user dummy
         */
        DB::transaction(function () {
            $hotelIds = Hotel::where('slug', 'like', '%-dummy-%')->pluck('id');
            if ($hotelIds->isEmpty()) {
                $hotelIds = Hotel::where('name', 'like', '[DUMMY]%')->pluck('id');
            }
            $roomTypeIds = RoomType::whereIn('hotel_id', $hotelIds)->pluck('id');

            $bookingIds = Booking::whereIn('hotel_id', $hotelIds)->pluck('id');
            if ($bookingIds->isNotEmpty()) {
                DB::table('booking_status_histories')->whereIn('booking_id', $bookingIds)->delete();
                DB::table('guests')->whereIn('booking_id', $bookingIds)->delete();
                DB::table('payments')->whereIn('booking_id', $bookingIds)->delete();
                DB::table('refunds')->whereIn('booking_id', $bookingIds)->delete();
                DB::table('e_tickets')->whereIn('booking_id', $bookingIds)->delete();
                DB::table('reviews')->whereIn('booking_id', $bookingIds)->delete();
                BookingRoom::whereIn('booking_id', $bookingIds)->delete();
                Booking::whereIn('id', $bookingIds)->delete();
                $this->info('Bookings deleted: '.count($bookingIds));
            }

            DB::table('room_availabilities')->whereIn('room_type_id', $roomTypeIds)->delete();
            DB::table('room_price_histories')->whereIn('room_type_id', $roomTypeIds)->delete();
            RoomPhoto::whereIn('room_type_id', $roomTypeIds)->delete();
            DB::table('room_facilities')->whereIn('room_type_id', $roomTypeIds)->delete();
            RoomType::whereIn('hotel_id', $hotelIds)->forceDelete();

            HotelPhoto::whereIn('hotel_id', $hotelIds)->delete();
            DB::table('hotel_facilities')->whereIn('hotel_id', $hotelIds)->delete();

            $deletedHotels = Hotel::whereIn('id', $hotelIds)->forceDelete();
            $this->info("Hotels deleted: {$deletedHotels}");

            $deletedUsers = User::where('email', 'like', 'hotel%@hleven.com')
                ->where('email', 'regexp', '^hotel[0-9]{2}@hleven\\.com$')
                ->delete();
            $this->info("Users deleted: {$deletedUsers}");
        });

        $this->info('Purge dummy selesai.');

        return self::SUCCESS;
    }
}
