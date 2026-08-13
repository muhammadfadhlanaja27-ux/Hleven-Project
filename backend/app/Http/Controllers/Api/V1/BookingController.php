<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    // Menampilkan daftar semua booking yang masuk ke hotel
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        // Mengambil booking berdasarkan kamar yang ada di hotel tersebut
        $bookings = Booking::whereHas('rooms.roomType', function($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->with(['user', 'rooms.roomType'])->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    // Menampilkan detail booking tertentu
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['user', 'rooms.roomType', 'payments'])->find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }

    // Mengubah status booking (misal: confirmed, checked_in, completed, cancelled)
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