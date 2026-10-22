<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QRCodeController extends Controller
{
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first() ?? Hotel::first();

        $booking = Booking::with(['user', 'bookingRooms.roomType', 'guests'])
            ->where('booking_code', trim($request->booking_code))
            ->where('hotel_id', $hotel ? $hotel->id : null)
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'E-Tiket / Kode Booking tidak valid atau tidak terdaftar di hotel ini.'
            ], 404);
        }

        $currentStatus = strtolower($booking->status);

        if ($currentStatus === 'checked_in') {
            return response()->json([
                'status' => 'warning',
                'message' => 'Tamu ini sudah melakukan Check-in sebelumnya.',
                'data' => $booking
            ], 400);
        }

        if (!in_array($currentStatus, ['paid', 'confirmed'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pemesanan belum lunas. Status saat ini: ' . strtoupper($booking->status)
            ], 400);
        }

        // Proses Check-in
        $booking->update(['status' => 'checked_in']);

        $guestName = $booking->guests->first()->name ?? $booking->user->name ?? 'Tamu';

        return response()->json([
            'status' => 'success',
            'message' => "Check-in berhasil! Selamat datang, {$guestName}.",
            'data' => $booking
        ]);
    }
}