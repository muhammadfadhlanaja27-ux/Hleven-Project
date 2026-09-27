<?php

namespace App\Console\Commands;

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

        if (!$this->option('force') && !$this->confirm('Lanjutkan hapus data dummy?')) {
            $this->info('Dibatalkan.');
            return self::SUCCESS;
        }

        DB::transaction(function () {
            $hotelIds = Hotel::where('slug', 'like', '%-dummy-%')->pluck('id');
            if ($hotelIds->isEmpty()) {
                $hotelIds = Hotel::where('name', 'like', '[DUMMY]%')->pluck('id');
            }
            $roomTypeIds = RoomType::whereIn('hotel_id', $hotelIds)->pluck('id');

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
