<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\RoomType;
use App\Models\RoomAvailability;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class CheckExpiredBookings extends Command
{
    /**
     * Nama perintah disesuaikan dengan yang ada di routes/console.php
     */
    protected $signature = 'booking:check-expired';
    protected $description = 'Membatalkan otomatis booking yang kadaluarsa dan mengembalikan stok kamar';

    public function handle()
    {
        // Cari booking status unpaid/pending yang lewat expired_at payment atau dibuat >15 menit lalu
        $expiredBookings = Booking::with(['bookingRooms', 'payment'])
            ->whereIn('status', ['unpaid', 'pending'])
            ->where(function ($query) {
                $query->whereHas('payment', function ($q) {
                    $q->where('expired_at', '<=', Carbon::now());
                })
                ->orWhere('created_at', '<=', Carbon::now()->subMinutes(15));
            })
            ->get();

        if ($expiredBookings->isEmpty()) {
            $this->info('Tidak ada booking yang kedaluwarsa.');
            return 0;
        }

        $count = 0;

        foreach ($expiredBookings as $booking) {
            DB::beginTransaction();
            try {
                $checkIn  = Carbon::parse($booking->check_in);
                $checkOut = Carbon::parse($booking->check_out);
                $period   = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

                foreach ($booking->bookingRooms as $bRoom) {
                    // 1. Restore Stok Master RoomType
                    RoomType::where('id', $bRoom->room_type_id)->increment('stock', $bRoom->qty);

                    // 2. Restore Stok Harian RoomAvailability
                    foreach ($period as $date) {
                        $dateStr = $date->format('Y-m-d');
                        $avail = RoomAvailability::where('room_type_id', $bRoom->room_type_id)
                            ->where('date', $dateStr)
                            ->first();

                        if ($avail) {
                            $avail->increment('available_stock', $bRoom->qty);
                            $avail->decrement('booked_room', $bRoom->qty);
                        }
                    }
                }

                // Update status booking dan payment
                $booking->update(['status' => 'expired']);
                if ($booking->payment) {
                    $booking->payment->update(['payment_status' => 'expired']);
                }

                DB::commit();
                $count++;
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Gagal membatalkan booking ID {$booking->id}: " . $e->getMessage());
            }
        }

        $this->info("Berhasil membatalkan {$count} booking yang kedaluwarsa.");
        return 0;
    }
}