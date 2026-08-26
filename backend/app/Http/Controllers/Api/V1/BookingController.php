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
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'data'   => $bookings
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
            'data'   => $booking
        ]);
    }

    // Mengubah status booking & Mengembalikan stok jika dibatalkan/expired/refunded
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,unpaid,paid,checked_in,checked_out,cancelled,expired,refunded,refund_pending'
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
            $activeStatuses = ['pending', 'unpaid', 'paid', 'confirmed', 'checked_in', 'refund_pending'];

            if (in_array($newStatus, $cancelStatuses) && in_array($oldStatus, $activeStatuses)) {
                $checkIn  = Carbon::parse($booking->check_in);
                $checkOut = Carbon::parse($booking->check_out);
                $period   = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

                foreach ($booking->bookingRooms as $bRoom) {
                    RoomType::where('id', $bRoom->room_type_id)->increment('stock', $bRoom->qty);

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

    // Pembatalan booking atau Pengajuan Refund oleh user
    public function cancelBooking(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        if (in_array($booking->status, ['unpaid', 'pending'])) {
            $request->merge(['status' => 'cancelled']);
            return $this->updateStatus($request, $booking->id);
        } elseif (in_array($booking->status, ['paid', 'confirmed'])) {
            $booking->update(['status' => 'refund_pending']);
            return response()->json([
                'status'  => 'success',
                'message' => 'Pengajuan refund berhasil dikirim. Menunggu persetujuan admin.',
                'data'    => $booking
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Booking tidak dapat dibatalkan atau sedang dalam proses refund'], 400);
    }

    // Persetujuan atau Penolakan Refund oleh Admin
    public function handleRefundApproval(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        if ($booking->status !== 'refund_pending') {
            return response()->json(['status' => 'error', 'message' => 'Pesanan ini tidak sedang dalam pengajuan refund'], 400);
        }

        if ($request->action === 'approve') {
            $request->merge(['status' => 'refunded']);
            return $this->updateStatus($request, $booking->id);
        } else {
            $booking->update(['status' => 'paid']);
            return response()->json([
                'status'  => 'success',
                'message' => 'Pengajuan refund ditolak. Status pesanan kembali menjadi Paid.',
                'data'    => $booking
            ]);
        }
    }

    // Download E-Tiket PDF untuk User
    public function downloadETicket(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'bookingRooms.roomType', 'guests', 'user'])
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        $validStatuses = ['paid', 'confirmed', 'checked_in', 'checked_out'];
        if (!in_array(strtolower($booking->status), $validStatuses)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'E-Tiket hanya tersedia untuk pemesanan yang telah lunas. Status saat ini: ' . $booking->status
            ], 400);
        }

        $pdf = Pdf::loadView('pdf.e-ticket', compact('booking'));
        return $pdf->download("E-Ticket-{$booking->booking_code}.pdf");
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
            'data'   => $bookings
        ]);
    }

    // Membuat booking baru dengan jumlah kamar manual pilihan user
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hotel_id'                 => 'required|integer',
            'room_type_id'             => 'required|integer',
            'check_in'                 => 'required|date',
            'check_out'                => 'required|date|after:check_in',
            'qty'                      => 'required|integer|min:1',
            'adults'                   => 'nullable|integer|min:1',
            'children'                 => 'nullable|integer|min:0',
            'guest_name'               => 'required|string|max:255',
            'guest_email'              => 'required|email|max:255',
            'guest_phone'              => 'required|string|max:30',
            'guest_identity'           => 'nullable|string|max:50',
            'special_request'          => 'nullable|string',
            'special_requests'         => 'nullable|string',
            'guests'                   => 'nullable|array',
            'guests.*.name'            => 'required_with:guests|string|max:255',
            'guests.*.phone'           => 'nullable|string|max:30',
            'guests.*.identity_number' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $qty = (int) $request->qty;
        $adults = (int) ($request->adults ?? 1);
        $children = (int) ($request->children ?? 0);
        $specialNotes = $request->special_requests ?? $request->special_request ?? null;

        // --- LAYER 0: Pengecekan Eksistensi Hotel & Kamar ---
        $queryRoomType = RoomType::where('id', $request->room_type_id)
            ->where('hotel_id', $request->hotel_id);

        if (Schema::hasColumn('room_types', 'is_active')) {
            $queryRoomType->where('is_active', true);
        }

        $queryRoomType->whereHas('hotel', function ($query) {
            $query->where('status', 'active');
        });

        $roomType = $queryRoomType->first();

        if (!$roomType) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tipe kamar atau hotel ini tidak ditemukan, sedang tidak aktif, atau ID tidak valid.'
            ], 422);
        }

        $capacityAdult = max(1, (int) ($roomType->capacity_adult ?? 2));
        $maxAdultAllowed = $capacityAdult * $qty;

        // Validasi jika jumlah tamu dewasa melebihi kapasitas kamar yang dipilih manual oleh user
        if ($adults > $maxAdultAllowed) {
            $minQtyNeeded = (int) ceil($adults / $capacityAdult);
            $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $request->check_in, $request->check_out, $adults);

            return response()->json([
                'status'      => 'error',
                'message'     => "Untuk {$adults} dewasa, Anda membutuhkan minimal {$minQtyNeeded} kamar. Silakan tambah jumlah kamar.",
                'suggestions' => $suggestions
            ], 422);
        }

        $checkIn     = Carbon::parse($request->check_in);
        $checkOut    = Carbon::parse($request->check_out);
        $checkInStr  = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();

        $totalNight = max(1, $checkIn->diffInDays($checkOut));
        $period     = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

        // --- LAYER 1: Pengecekan Bentrok Tanggal (Overlapping) pada Tabel Booking ---
        $bookedQtyInPeriod = BookingRoom::where('room_type_id', $roomType->id)
            ->whereHas('booking', function ($query) use ($checkInStr, $checkOutStr) {
                $query->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed', 'refund_pending'])
                    ->where('check_in', '<', $checkOutStr)
                    ->where('check_out', '>', $checkInStr);
            })
            ->sum('qty');

        $remainingStockDirect = ($roomType->stock ?? 10) - $bookedQtyInPeriod;

        if ($remainingStockDirect < $qty) {
            $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $adults);

            return response()->json([
                'status'      => 'error',
                'message'     => "Stok kamar '{$roomType->name}' tidak cukup ({$remainingStockDirect} kamar tersedia) untuk tanggal {$checkInStr} s/d {$checkOutStr}.",
                'suggestions' => $suggestions
            ], 422);
        }

        // --- LAYER 2: Pengecekan Stok Harian pada RoomAvailability ---
        foreach ($period as $date) {
            $avail = RoomAvailability::where('room_type_id', $roomType->id)
                ->where('date', $date->format('Y-m-d'))
                ->first();

            $currentStock = $avail ? $avail->available_stock : ($roomType->stock ?? 10);
            if ($currentStock < $qty) {
                $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $adults);

                return response()->json([
                    'status'      => 'error',
                    'message'     => "Stok kamar tidak cukup untuk tanggal " . $date->format('Y-m-d') . ". Sisa stok: {$currentStock}",
                    'suggestions' => $suggestions
                ], 422);
            }
        }

        // --- Hitung Harga ---
        $subtotal = 0;
        $weekdayPrice = $roomType->weekday_price ?? $roomType->price ?? 0;
        $weekendPrice = $roomType->weekend_price ?? $weekdayPrice;

        foreach ($period as $date) {
            $subtotal += ($date->isWeekend())
                ? ($weekendPrice * $qty)
                : ($weekdayPrice * $qty);
        }
        $tax = (int) round($subtotal * 0.21);
        $grandTotal = $subtotal + $tax;

        DB::beginTransaction();
        try {
            $bookingCode = 'HLVN-' . strtoupper(substr(md5(uniqid()), 0, 5)) . '-' . Carbon::now()->format('my');
            $userId = $request->user()?->id;

            $booking = Booking::create([
                'booking_code'    => $bookingCode,
                'user_id'         => $userId,
                'hotel_id'        => $request->hotel_id,
                'check_in'        => $checkInStr,
                'check_out'       => $checkOutStr,
                'total_night'     => $totalNight,
                'subtotal'        => $subtotal,
                'tax'             => $tax,
                'grand_total'     => $grandTotal,
                'special_request' => $specialNotes,
                'status'          => 'unpaid',
            ]);

            BookingRoom::create([
                'booking_id'      => $booking->id,
                'room_type_id'    => $roomType->id,
                'qty'             => $qty,
                'price_per_night' => ($weekdayPrice + $weekendPrice) / 2,
                'subtotal'        => $subtotal,
            ]);

            // --- 1. Kurangi Stok Utama RoomType ---
            if (isset($roomType->stock)) {
                $roomType->decrement('stock', $qty);
            }

            // --- 2. Update/Kurangi stok room_availabilities (harian) ---
            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                $avail = RoomAvailability::where('room_type_id', $roomType->id)
                    ->where('date', $dateStr)
                    ->first();

                if ($avail) {
                    $avail->decrement('available_stock', $qty);
                    $avail->increment('booked_room', $qty);
                } else {
                    RoomAvailability::create([
                        'room_type_id'    => $roomType->id,
                        'date'            => $dateStr,
                        'available_stock' => max(0, ($roomType->stock ?? 10) - $qty),
                        'booked_room'     => $qty,
                    ]);
                }
            }

            // --- Simpan Guest Utama ---
            Guest::create([
                'booking_id'      => $booking->id,
                'name'            => $request->guest_name,
                'phone'           => $request->guest_phone,
                'identity_number' => $request->guest_identity ?? '-',
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
        $hasIsActive = Schema::hasColumn('room_types', 'is_active');

        $sameHotelQuery = RoomType::where('hotel_id', $hotelId)
            ->where('id', '!=', $currentRoomTypeId);

        if ($hasIsActive) {
            $sameHotelQuery->where('is_active', true);
        }

        $sameHotelRooms = $sameHotelQuery->whereHas('hotel', function ($q) {
                $q->where('status', 'active');
            })
            ->where('capacity_adult', '>=', $adults)
            ->get()
            ->filter(function ($r) use ($checkInStr, $checkOutStr) {
                $booked = BookingRoom::where('room_type_id', $r->id)
                    ->whereHas('booking', function ($q) use ($checkInStr, $checkOutStr) {
                        $q->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed', 'refund_pending'])
                          ->where('check_in', '<', $checkOutStr)
                          ->where('check_out', '>', $checkInStr);
                    })->sum('qty');
                return (($r->stock ?? 10) - $booked) > 0;
            });

        if ($sameHotelRooms->isNotEmpty()) {
            return [
                'type'  => 'same_hotel',
                'rooms' => $sameHotelRooms->values()
            ];
        }

        $currentHotel = Hotel::find($hotelId);
        $cityId = $currentHotel->city_id ?? null;

        $otherHotelQuery = RoomType::query();
        if ($hasIsActive) {
            $otherHotelQuery->where('is_active', true);
        }

        $otherHotelRooms = $otherHotelQuery->whereHas('hotel', function ($q) use ($cityId, $hotelId) {
                $q->where('status', 'active');
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
                        $q->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed', 'refund_pending'])
                          ->where('check_in', '<', $checkOutStr)
                          ->where('check_out', '>', $checkInStr);
                    })->sum('qty');
                return (($r->stock ?? 10) - $booked) > 0;
            });

        return [
            'type'  => 'other_hotels_in_city',
            'rooms' => $otherHotelRooms->values()
        ];
    }
}