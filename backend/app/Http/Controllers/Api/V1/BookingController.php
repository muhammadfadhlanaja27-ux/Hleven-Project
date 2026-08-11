<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\RoomType;
use App\Models\RoomAvailability;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_type_id' => 'required|exists:room_types,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'qty' => 'required|integer|min:1',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'special_request' => 'nullable|string',
        ]);

        $room = RoomType::findOrFail($request->room_type_id);

        // 1. Validasi Kapasitas
        $capacityCheck = $this->bookingService->validateCapacity(
            $request->room_type_id, 
            $request->adults, 
            $request->children, 
            $request->qty
        );

        if (!$capacityCheck['allowed']) {
            return response()->json(['success' => false, 'message' => $capacityCheck['message']], 422);
        }

        // 2. Cek Ketersediaan
        if (!$this->bookingService->checkAvailability($request->room_type_id, $request->check_in, $request->check_out, $request->qty)) {
            return response()->json(['success' => false, 'message' => 'Kamar tidak tersedia pada tanggal tersebut'], 400);
        }

        // 3. Hitung Harga Total & Rata-rata per malam
        $totalNight = Carbon::parse($request->check_in)->diffInDays($request->check_out);
        $totalPrice = $this->bookingService->calculatePrice($request->room_type_id, $request->check_in, $request->check_out);
        
        $subtotal = $totalPrice * $request->qty;
        $pricePerNight = $totalNights > 0 ? $subtotal / ($totalNight * $request->qty) : $subtotal;
        
        $tax = $subtotal * 0.1; // Pajak 10%
        $grandTotal = $subtotal + $tax;

        // 4. Jalankan Transaksi Database
        return DB::transaction(function () use ($request, $room, $totalNight, $subtotal, $tax, $grandTotal, $pricePerNight) {
            
            // Buat Booking
            $booking = Booking::create([
                'booking_code' => 'HLV-' . strtoupper(Str::random(8)),
                'user_id' => $request->user()->id,
                'hotel_id' => $room->hotel_id,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'total_night' => $totalNight,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'grand_total' => $grandTotal,
                'special_request' => $request->special_request,
                'status' => 'pending',
            ]);

            // Simpan detail kamar
            BookingRoom::create([
                'booking_id' => $booking->id,
                'room_type_id' => $request->room_type_id,
                'qty' => $request->qty,
                'price_per_night' => $pricePerNight,
                'subtotal' => $subtotal,
            ]);

            // Kurangi stok di RoomAvailability
            $period = \Carbon\CarbonPeriod::create($request->check_in, Carbon::parse($request->check_out)->subDay());
            foreach ($period as $date) {
                $avail = RoomAvailability::firstOrNew([
                    'room_type_id' => $request->room_type_id,
                    'date' => $date->format('Y-m-d')
                ]);
                
                $avail->available_stock = ($avail->available_stock ?? $room->stock) - $request->qty;
                $avail->booked_room = ($avail->booked_room ?? 0) + $request->qty;
                $avail->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat. Silakan selesaikan pembayaran.',
                'data' => $booking
            ], 201);
        });
    }

    /**
     * TAMBAHAN: Untuk menampilkan daftar pesanan khusus Admin Hotel
     */
    public function indexAdmin(Request $request)
    {
        $adminId = $request->user()->id;
        $hotel = \App\Models\Hotel::where('admin_id', $adminId)->first();

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan untuk admin ini'], 404);
        }

        $bookings = Booking::with(['user', 'bookingRooms.roomType'])
            ->where('hotel_id', $hotel->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * TAMBAHAN: Untuk mengubah status booking (Check-In / Check-Out / Cancel)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,checked_in,checked_out,cancelled'
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status booking berhasil diperbarui',
            'data' => $booking
        ]);
    }
}