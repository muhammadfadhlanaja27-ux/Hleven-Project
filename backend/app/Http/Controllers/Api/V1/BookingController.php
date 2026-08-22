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

        // Menggunakan kolom hotel_id langsung dan relasi bookingRooms serta payment
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
        // Menyesuaikan relasi dengan model Booking.php ('bookingRooms' dan 'payment')
        $booking = Booking::with(['user', 'bookingRooms.roomType', 'payment', 'guests'])->find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }

    // Mengubah status booking (misal: pending, confirmed, checked_in, completed, cancelled)
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,unpaid,paid,checked_in,checked_out,cancelled,expired,refunded'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        $booking->update([
            'status' => $request->status
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking status updated successfully',
            'data' => $booking
        ]);
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

    // Membuat booking baru oleh user
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
            'special_request'  => 'nullable|string',
            'guests'           => 'nullable|array',
            'guests.*.name'    => 'required_with:guests|string|max:255',
            'guests.*.phone'   => 'nullable|string|max:20',
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
                'message' => 'Room type not found for this hotel.'
            ], 404);
        }

        $checkIn  = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $totalNight = $checkIn->diffInDays($checkOut);
        $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

        // --- Cek Ketersediaan Stok ---
        foreach ($period as $date) {
            $avail = RoomAvailability::where('room_type_id', $roomType->id)
                ->where('date', $date->format('Y-m-d'))
                ->first();

            $currentStock = $avail ? $avail->available_stock : $roomType->stock;
            if ($currentStock < $request->qty) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Kamar tidak tersedia untuk tanggal " . $date->format('Y-m-d') . ". Sisa stok: {$currentStock}"
                ], 400);
            }
        }

        // --- Cek Kapasitas ---
        $maxAdult = $roomType->capacity_adult * $request->qty;
        $maxChild = $roomType->capacity_child * $request->qty;
        $children = $request->children ?? 0;
        if ($request->adults > $maxAdult || $children > $maxChild) {
            return response()->json([
                'status' => 'error',
                'message' => "Jumlah tamu melebihi kapasitas. Maks: {$maxAdult} dewasa, {$maxChild} anak."
            ], 400);
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
                'check_in'        => $checkIn->toDateString(),
                'check_out'       => $checkOut->toDateString(),
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

            // --- Update stok room_availabilities ---
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
                        'available_stock' => $roomType->stock - $request->qty,
                        'booked_room'     => $request->qty,
                    ]);
                }
            }

            // --- Simpan Guest Utama ---
            Guest::create([
                'booking_id' => $booking->id,
                'name'       => $request->guest_name,
                'phone'      => $request->guest_phone,
            ]);

            // --- Simpan Guest Tambahan ---
            if ($request->has('guests') && is_array($request->guests)) {
                foreach ($request->guests as $g) {
                    Guest::create([
                        'booking_id' => $booking->id,
                        'name'       => $g['name'],
                        'phone'      => $g['phone'] ?? null,
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
}