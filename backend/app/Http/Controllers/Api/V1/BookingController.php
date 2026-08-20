<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use Illuminate\Http\Request;
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
            'status' => 'required|in:pending,confirmed,checked_in,completed,cancelled'
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
}