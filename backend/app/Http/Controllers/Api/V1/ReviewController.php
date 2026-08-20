<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

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

        $reviews = Review::where('hotel_id', $hotel->id)
            ->with(['user', 'booking'])
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id'          => $r->id,
                    'rating'      => $r->rating,
                    'comment'     => $r->comment,
                    'reply'       => $r->reply,
                    'reply_at'    => $r->reply_at,
                    'created_at'  => $r->created_at,
                    'guest' => [
                        'name'   => $r->user ? $r->user->name : 'Guest',
                        'avatar' => null,
                    ],
                    'booking_code' => $r->booking ? $r->booking->booking_code : null,
                ];
            });

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