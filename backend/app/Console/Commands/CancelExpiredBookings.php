<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredBookings extends Command
{
    /**
     * Nama dan deskripsi perintah CLI
     */
    protected $signature = 'booking:cancel-expired';

    protected $description = 'Membatalkan booking yang kadaluarsa dan mengembalikan stok kamar';

    /**
     * Execute the console command.
     *
     * Membatalkan booking status unpaid/pending yang lewat:
     * - expired_at payment (sudah lewat tanggal kadaluarsa pembayaran), ATAU
     * - created_at > 15 menit lalu (booking lama belum dibayar)
     *
     * Proses untuk setiap booking:
     * 1. Kembalikan stok ke master RoomType
     * 2. Kembalikan stok harian ke RoomAvailability per tanggal rentan check-in/out
     * 3. Update status booking menjadi 'expired' dan sinkronkan payment status
     * 4. Gunakan transaksi database untuk ke konsistenan data
     *
     * @return int - Jumlah booking berhasil dibatalkan (0 jika tidak ada)
     */
    public function handle()
    {
        /**
         * Cari booking status unpaid/pending yang expired:
         * - Payment sudah lewat expired_at, ATAU
         * - Booking dibuat > 15 menit ago dan masih unpaid/pending
         *
         * Gunakan eager loading bookingRooms dan payment untuk menghindari
         * query tambahan di dalam loop.
         *
         * @var \App\Models\Booking[]
         */
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

        /**
         * Loop melalui setiap booking kedaluwarsa.
         * Setiap iterasi menggunakan transaksi database untuk memastikan
         * restore stok dan update status terjadi secara atomic.
         *
         * @var \App\Models\Booking $booking
         */
        foreach ($expiredBookings as $booking) {
            DB::beginTransaction();
            try {
                $checkIn = Carbon::parse($booking->check_in);
                $checkOut = Carbon::parse($booking->check_out);
                $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

                /**
                 * 1. Kembalikan stok ke master RoomType berdasarkan room_type_id
                 * dan qty dari booking room. Increment memastikan stok tidak
                 * berhambar karena booking expired.
                 *
                 * @var \App\Models\RoomType $roomType
                 */
                foreach ($booking->bookingRooms as $bRoom) {
                    RoomType::where('id', $bRoom->room_type_id)->increment('stock', $bRoom->qty);

                    /**
                     * 2. Kembalikan stok harian ke RoomAvailability per tanggal.
                     * Loop melalui CarbonPeriod dari check-in hingga hari sebelum check-out.
                     * Setiap tanggal mendapatkan increment available_stock dan decrement booked_room.
                     *
                     * @var \Carbon\Carbon $date
                     */
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

                /**
                 * Update status booking menjadi 'expired' dan sinkronkan
                 * payment status menjadi 'expired' jika ada payment terkait.
                 * Prokes ini memastikan booking dan payment dalam konsistensi sama.
                 */
                $booking->update(['status' => 'expired']);
                if ($booking->payment) {
                    $booking->payment->update(['payment_status' => 'expired']);
                }

                DB::commit();
                $count++;
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Gagal membatalkan booking ID {$booking->id}: ".$e->getMessage());
            }
        }

        $this->info("Berhasil membatalkan {$count} booking yang kedaluwarsa.");

        return 0;
    }
}
