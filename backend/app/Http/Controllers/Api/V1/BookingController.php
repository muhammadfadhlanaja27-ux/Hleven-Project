<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    // Menampilkan daftar semua booking yang masuk ke hotel admin yang sedang login
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first() ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $bookings = Booking::with(['user', 'bookingRooms.roomType', 'payment'])
            ->where('hotel_id', $hotel->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    // Menampilkan detail booking tertentu berdasarkan ID
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['user', 'bookingRooms.roomType', 'payment', 'guests'])->find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }

    // Mengubah status booking & Mengembalikan stok jika dibatalkan/expired
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,unpaid,paid,checked_in,checked_out,cancelled,expired,refunded'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = Booking::with('bookingRooms')->find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        $oldStatus = $booking->status;
        $newStatus = $request->status;

        DB::beginTransaction();
        try {
            $cancelStatuses = ['cancelled', 'expired', 'refunded'];
            $activeStatuses = ['pending', 'unpaid', 'paid', 'confirmed', 'checked_in'];

            // Jika status berubah dari aktif menjadi batal/expired, kembalikan stok
            if (in_array($newStatus, $cancelStatuses) && in_array($oldStatus, $activeStatuses)) {
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
            }

            $booking->update([
                'status' => $newStatus
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Booking status updated successfully',
                'data'    => $booking
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memperbarui status: ' . $e->getMessage()
            ], 500);
        }
    }

    // Pembatalan booking langsung oleh user
    public function cancelBooking(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        if (!in_array($booking->status, ['unpaid', 'pending'])) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak dapat dibatalkan'], 400);
        }

        $request->merge(['status' => 'cancelled']);
        return $this->updateStatus($request, $booking->id);
    }

    // Menampilkan daftar booking milik user yang sedang login
    public function userBookings(Request $request)
    {
        $user = $request->user();

        $bookings = Booking::with(['hotel', 'bookingRooms.roomType.photos', 'payment'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    // Membuat booking baru oleh user dengan Validasi Bentrok Tanggal (Overlapping)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hotel_id'         => 'required|exists:hotels,id',
            'room_type_id'     => 'required|exists:room_types,id',
            'check_in'         => 'required|date|after_or_equal:today',
            'check_out'        => 'required|date|after:check_in',
            'qty'              => 'required|integer|min:1',
            'adults'           => 'required|integer|min:1',
            'children'         => 'nullable|integer|min:0',
            'guest_name'       => 'required|string|max:255',
            'guest_email'      => 'required|email',
            'guest_phone'      => 'required|string|max:20',
            'guest_identity'   => 'nullable|string|max:50',
            'special_request'  => 'nullable|string',
            'guests'           => 'nullable|array',
            'guests.*.name'    => 'required_with:guests|string|max:255',
            'guests.*.phone'   => 'nullable|string|max:20',
            'guests.*.identity_number' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $roomType = RoomType::where('id', $request->room_type_id)
            ->where('hotel_id', $request->hotel_id)
            ->first();

        if (!$roomType) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tipe kamar tidak ditemukan pada hotel ini.'
            ], 404);
        }

        $checkIn  = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $checkInStr  = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();

        $totalNight = $checkIn->diffInDays($checkOut);
        $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

        // --- LAYER 1: Pengecekan Bentrok Tanggal (Overlapping) pada Tabel Booking ---
        $bookedQtyInPeriod = BookingRoom::where('room_type_id', $roomType->id)
            ->whereHas('booking', function ($query) use ($checkInStr, $checkOutStr) {
                $query->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed'])
                    ->where('check_in', '<', $checkOutStr)
                    ->where('check_out', '>', $checkInStr);
            })
            ->sum('qty');

        $remainingStockDirect = $roomType->stock - $bookedQtyInPeriod;

        if ($remainingStockDirect < $request->qty) {
            $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $request->adults);

            return response()->json([
                'status' => 'error',
                'message' => "Kamar '{$roomType->name}' sudah dipesan oleh pengguna lain untuk tanggal {$checkInStr} s/d {$checkOutStr}.",
                'suggestions' => $suggestions
            ], 422);
        }

        // --- LAYER 2: Pengecekan Stok Harian pada RoomAvailability ---
        foreach ($period as $date) {
            $avail = RoomAvailability::where('room_type_id', $roomType->id)
                ->where('date', $date->format('Y-m-d'))
                ->first();

            $currentStock = $avail ? $avail->available_stock : $roomType->stock;
            if ($currentStock < $request->qty) {
                $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $request->adults);

                return response()->json([
                    'status' => 'error',
                    'message' => "Kamar tidak tersedia untuk tanggal " . $date->format('Y-m-d') . ". Sisa stok: {$currentStock}",
                    'suggestions' => $suggestions
                ], 422);
            }
        }

        // --- Cek Kapasitas Tamu ---
        $maxAdult = $roomType->capacity_adult * $request->qty;
        $maxChild = $roomType->capacity_child * $request->qty;
        $children = $request->children ?? 0;
        if ($request->adults > $maxAdult || $children > $maxChild) {
            $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $request->adults);

            return response()->json([
                'status' => 'error',
                'message' => "Jumlah tamu melebihi kapasitas. Maksimal: {$maxAdult} dewasa, {$maxChild} anak.",
                'suggestions' => $suggestions
            ], 422);
        }

        // --- Hitung Harga ---
        $subtotal = 0;
        foreach ($period as $date) {
            $subtotal += ($date->isWeekend())
                ? ($roomType->weekend_price * $request->qty)
                : ($roomType->weekday_price * $request->qty);
        }
        $tax = (int) round($subtotal * 0.21);
        $grandTotal = $subtotal + $tax;

        DB::beginTransaction();
        try {
            $bookingCode = 'HLVN-' . strtoupper(substr(md5(uniqid()), 0, 5)) . '-' . Carbon::now()->format('my');

            $booking = Booking::create([
                'booking_code'    => $bookingCode,
                'user_id'         => $request->user()->id,
                'hotel_id'        => $request->hotel_id,
                'check_in'        => $checkInStr,
                'check_out'       => $checkOutStr,
                'total_night'     => $totalNight,
                'subtotal'        => $subtotal,
                'tax'             => $tax,
                'grand_total'     => $grandTotal,
                'special_request' => $request->special_request,
                'status'          => 'unpaid',
            ]);

            BookingRoom::create([
                'booking_id'      => $booking->id,
                'room_type_id'    => $roomType->id,
                'qty'             => $request->qty,
                'price_per_night' => ($roomType->weekday_price + $roomType->weekend_price) / 2,
                'subtotal'        => $subtotal,
            ]);

            // --- 1. Kurangi Stok Utama RoomType ---
            $roomType->decrement('stock', $request->qty);

            // --- 2. Update/Kurangi stok room_availabilities (harian) ---
            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                $avail = RoomAvailability::where('room_type_id', $roomType->id)
                    ->where('date', $dateStr)
                    ->first();

                if ($avail) {
                    $avail->decrement('available_stock', $request->qty);
                    $avail->increment('booked_room', $request->qty);
                } else {
                    RoomAvailability::create([
                        'room_type_id'    => $roomType->id,
                        'date'            => $dateStr,
                        'available_stock' => $roomType->stock, // Sudah ter-decrement di atas
                        'booked_room'     => $request->qty,
                    ]);
                }
            }

            // --- Simpan Guest Utama ---
            Guest::create([
                'booking_id'      => $booking->id,
                'name'            => $request->guest_name,
                'phone'           => $request->guest_phone,
                'identity_number' => $request->guest_identity ?? $request->identity_number ?? '-',
            ]);

            // --- Simpan Guest Tambahan ---
            if ($request->has('guests') && is_array($request->guests)) {
                foreach ($request->guests as $g) {
                    Guest::create([
                        'booking_id'      => $booking->id,
                        'name'            => $g['name'],
                        'phone'           => $g['phone'] ?? null,
                        'identity_number' => $g['identity_number'] ?? '-',
                    ]);
                }
            }

            // --- Buat record Payment ---
            $payment = Payment::create([
                'booking_id'     => $booking->id,
                'payment_status' => 'pending',
                'gross_amount'   => $grandTotal,
                'order_id'       => $bookingCode,
                'expired_at'     => Carbon::now()->addMinutes(15),
            ]);

            DB::commit();

            $booking->load(['hotel', 'bookingRooms.roomType.photos', 'payment', 'guests']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Booking berhasil dibuat. Silakan lakukan pembayaran.',
                'data'    => [
                    'booking' => $booking,
                    'payment' => $payment,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal membuat booking: ' . $e->getMessage()
            ], 500);
        }
    }

    // Helper Pencarian Kamar / Hotel Alternatif
    private function getAlternativeRooms($hotelId, $currentRoomTypeId, $checkInStr, $checkOutStr, $adults)
    {
        // 1. Cari kamar lain di hotel yang sama
        $sameHotelRooms = RoomType::where('hotel_id', $hotelId)
            ->where('id', '!=', $currentRoomTypeId)
            ->where('capacity_adult', '>=', $adults)
            ->get()
            ->filter(function ($r) use ($checkInStr, $checkOutStr) {
                $booked = BookingRoom::where('room_type_id', $r->id)
                    ->whereHas('booking', function ($q) use ($checkInStr, $checkOutStr) {
                        $q->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed'])
                          ->where('check_in', '<', $checkOutStr)
                          ->where('check_out', '>', $checkInStr);
                    })->sum('qty');
                return ($r->stock - $booked) > 0;
            });

        if ($sameHotelRooms->isNotEmpty()) {
            return [
                'type' => 'same_hotel',
                'rooms' => $sameHotelRooms->values()
            ];
        }

        // 2. Cari kamar di hotel lain di kota yang sama
        $currentHotel = Hotel::find($hotelId);
        $cityId = $currentHotel->city_id ?? null;

        $otherHotelRooms = RoomType::whereHas('hotel', function ($q) use ($cityId, $hotelId) {
                if ($cityId) {
                    $q->where('city_id', $cityId);
                }
                $q->where('id', '!=', $hotelId);
            })
            ->where('capacity_adult', '>=', $adults)
            ->get()
            ->filter(function ($r) use ($checkInStr, $checkOutStr) {
                $booked = BookingRoom::where('room_type_id', $r->id)
                    ->whereHas('booking', function ($q) use ($checkInStr, $checkOutStr) {
                        $q->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed'])
                          ->where('check_in', '<', $checkOutStr)
                          ->where('check_out', '>', $checkInStr);
                    })->sum('qty');
                return ($r->stock - $booked) > 0;
            });

        return [
            'type' => 'other_hotels_in_city',
            'rooms' => $otherHotelRooms->values()
        ];
    }
}   