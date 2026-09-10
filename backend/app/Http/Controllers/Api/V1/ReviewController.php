<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;
use App\Models\Booking;

class ReviewController extends Controller
{
    public function publicIndex(Request $request, $hotelId)
    {
        $query = Review::with(['user', 'booking.bookingRooms.roomType', 'booking.guests'])
            ->where('hotel_id', $hotelId);

        if ($request->has('search') && $request->search != '') {
            $query->where('comment', 'like', '%' . $request->search . '%');
        }
        if ($request->has('rating') && $request->rating != 'all') {
            $query->where('rating', $request->rating);
        }
        if ($request->has('roomTypeId') && $request->roomTypeId != 'all') {
            $query->whereHas('booking.bookingRooms', function ($q) use ($request) {
                $q->where('room_type_id', $request->roomTypeId);
            });
        }

        $reviews = $query->latest()->paginate($request->get('limit', 10));

        $stats = [
            'average_rating' => Review::where('hotel_id', $hotelId)->avg('rating') ?? 0,
            'total_reviews' => Review::where('hotel_id', $hotelId)->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $reviews,
            'stats' => $stats
        ]);
    }

    public function eligibleBookings(Request $request, $hotelId)
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->where('hotel_id', $hotelId)
            ->where('status', 'checked_out')
            ->whereDoesntHave('review')
            ->with(['bookingRooms.roomType'])
            ->get();
            
        return response()->json(['status' => 'success', 'data' => $bookings]);
    }

    public function store(Request $request, $hotelId)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $request->user()->id)
            ->where('hotel_id', $hotelId)
            ->where('status', 'checked_out')
            ->first();

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not eligible for review'], 403);
        }

        if (Review::where('booking_id', $booking->id)->exists()) {
            return response()->json(['status' => 'error', 'message' => 'Review already exists for this booking'], 409);
        }

        $review = Review::create([
            'booking_id' => $booking->id,
            'hotel_id' => $hotelId,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json(['status' => 'success', 'data' => $review]);
    }

    // Menampilkan daftar ulasan yang diberikan untuk hotel
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first() ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $reviews = Review::where('hotel_id', $hotel->id)
            ->orWhereHas('booking', function($q) use ($hotel) {
                $q->where('hotel_id', $hotel->id);
            })
            ->with(['user', 'booking.bookingRooms.roomType'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $reviews
        ]);
    }

    // Menanggapi ulasan dari tamu
    public function reply(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reply' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $review = Review::find($id);

        if (!$review) {
            return response()->json(['status' => 'error', 'message' => 'Review not found'], 404);
        }

        $review->update([
            'reply'    => $request->reply,
            'reply_at' => Carbon::now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Reply sent successfully',
            'data'    => $review
        ]);
    }

    // Menghapus ulasan (jika mengandung konten tidak pantas)
    public function destroy($id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['status' => 'error', 'message' => 'Review not found'], 404);
        }

        $review->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Review deleted successfully'
        ]);
    }
}