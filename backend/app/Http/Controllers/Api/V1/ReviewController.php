<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    // Menampilkan daftar ulasan yang diberikan untuk hotel
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $reviews = Review::whereHas('booking.rooms.roomType', function($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->with(['user', 'booking.rooms.roomType'])->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $reviews
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
            'reply' => $request->reply
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reply sent successfully',
            'data' => $review
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