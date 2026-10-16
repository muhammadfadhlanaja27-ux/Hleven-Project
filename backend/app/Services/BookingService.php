<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\RoomType;
use App\Models\RoomAvailability;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    /**
     * Memproses Pembuatan Reservasi Utama (Guest Checkout & Login User)
     */
    public function createBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();

            $checkIn = Carbon::parse($data['check_in']);
            $checkOut = Carbon::parse($data['check_out']);
            $totalNight = max(1, $checkIn->diffInDays($checkOut));
            $qty = (int) ($data['qty'] ?? 1);

            // Perhitungan Harga Dasar & Pajak
            $pricePerNight = $this->calculatePrice($data['room_type_id'], $data['check_in'], $data['check_out']);
            $subtotal = $pricePerNight * $qty;
            $tax = (int) round($subtotal * 0.21); // Pajak & Pelayanan 21%
            $grandTotal = $subtotal + $tax;

            // Logika Pemesan Utama (Auth User vs Guest Checkout)
            $userId = $user ? $user->id : null;
            $bookerName = $user ? $user->name : ($data['booker_name'] ?? $data['guest_name'] ?? 'Guest');
            $bookerEmail = $user ? $user->email : ($data['booker_email'] ?? $data['guest_email'] ?? null);
            $bookerPhone = $user ? ($user->phone ?? ($data['booker_phone'] ?? null)) : ($data['booker_phone'] ?? null);

            // Logika Tamu Menginap (Pesan untuk Orang Lain)
            $isForOtherGuest = filter_var($data['is_for_other_guest'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $guestName = $isForOtherGuest ? ($data['guest_name'] ?? $bookerName) : $bookerName;
            $guestEmail = $isForOtherGuest ? ($data['guest_email'] ?? $bookerEmail) : $bookerEmail;
            $guestPhone = $isForOtherGuest ? ($data['guest_phone'] ?? $bookerPhone) : $bookerPhone;

            // Kode Unik Booking
            $bookingCode = 'HLVN-' . strtoupper(Str::random(5)) . '-' . date('Ymd');

            // 1. Simpan Record Booking Utama
            $booking = Booking::create([
                'booking_code'       => $bookingCode,
                'user_id'            => $userId,
                'hotel_id'           => $data['hotel_id'],
                'check_in'           => $checkIn->format('Y-m-d'),
                'check_out'          => $checkOut->format('Y-m-d'),
                'total_night'        => $totalNight,
                'children_count'     => $data['children'] ?? $data['children_count'] ?? 0,
                'subtotal'           => $subtotal,
                'tax'                => $tax,
                'grand_total'        => $grandTotal,
                'special_request'    => $data['special_request'] ?? $data['special_requests'] ?? null,
                'status'             => 'pending',

                'booker_name'        => $bookerName,
                'booker_email'       => $bookerEmail,
                'booker_phone'       => $bookerPhone,

                'is_for_other_guest' => $isForOtherGuest,
                'guest_name'         => $guestName,
                'guest_email'        => $guestEmail,
                'guest_phone'        => $guestPhone,
            ]);

            // 2. Simpan Item Kamar (BookingRoom)
            BookingRoom::create([
                'booking_id'      => $booking->id,
                'room_type_id'    => $data['room_type_id'],
                'qty'             => $qty,
                'price_per_night' => $pricePerNight,
                'subtotal'        => $subtotal,
            ]);

            // 3. Simpan Record Guest (Tamu Menginap)
            Guest::create([
                'booking_id' => $booking->id,
                'name'       => $guestName,
                'email'      => $guestEmail,
                'phone'      => $guestPhone,
            ]);

            // 4. Inisialisasi Record Pembayaran
            Payment::create([
                'booking_id'     => $booking->id,
                'payment_code'   => 'PAY-' . $bookingCode,
                'amount'         => $grandTotal,
                'status'         => 'pending',
                'payment_method' => $data['payment_method'] ?? 'qris',
            ]);

            return $booking->load(['hotel', 'bookingRooms.roomType', 'payment', 'guests']);
        });
    }

    /**
     * Validasi Kapasitas Tamu
     */
    public function validateCapacity($roomTypeId, $adults, $children, $qty)
    {
        $room = RoomType::findOrFail($roomTypeId);
        
        $totalMaxAdult = $room->capacity_adult * $qty;
        $totalMaxChild = $room->capacity_child * $qty;

        if ($adults > $totalMaxAdult) {
            return [
                'allowed' => false,
                'message' => "Kapasitas tidak mencukupi. Mohon tambah jumlah kamar atau pilih tipe kamar yang lebih besar."
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Hitung Harga Total Berdasarkan Weekday / Weekend
     */
    public function calculatePrice($roomTypeId, $checkIn, $checkOut)
    {
        $room = RoomType::findOrFail($roomTypeId);
        $period = CarbonPeriod::create($checkIn, Carbon::parse($checkOut)->subDay());
        $total = 0;
        
        foreach ($period as $date) {
            $total += ($date->isWeekend()) ? $room->weekend_price : $room->weekday_price;
        }

        return $total;
    }

    /**
     * Cek Ketersediaan Kamar Harian
     */
    public function checkAvailability($roomTypeId, $checkIn, $checkOut, $qty)
    {
        $period = CarbonPeriod::create($checkIn, Carbon::parse($checkOut)->subDay());
        
        foreach ($period as $date) {
            $avail = RoomAvailability::where('room_type_id', $roomTypeId)
                        ->where('date', $date->format('Y-m-d'))
                        ->first();

            $currentStock = $avail ? $avail->available_stock : RoomType::find($roomTypeId)->stock;
            
            if ($currentStock < $qty) {
                return false;
            }
        }

        return true;
    }
}