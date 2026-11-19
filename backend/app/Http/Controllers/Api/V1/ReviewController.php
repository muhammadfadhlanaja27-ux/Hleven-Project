<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Resync kolom average_rating & total_review di tabel hotels
     * agar rating yang tampil di landing page selalu ter-update.
     */
    /**
     * Resync kolom average_rating & total_review di tabel hotels
     * agar rating yang tampil di landing page selalu ter-update.
     */
    private function syncHotelRatingStats(int $hotelId): void
    {
        Hotel::where('id', $hotelId)->update([
            'average_rating' => round(Review::where('hotel_id', $hotelId)->avg('rating') ?? 0, 1),
            'total_review' => Review::where('hotel_id', $hotelId)->count(),
        ]);
    }

    /**
     * Menampilkan daftar ulasan publik untuk hotel tertentu.
     *
     * Fitur filter:
     * - search: mencari kata kunci dalam kolom comment
     * - rating: filter berdasarkan rating (1-5 atau 'all')
     * - roomTypeId: filter berdasarkan room type yang digunakan di booking
     *
     * @param \Illuminate\Http\Request $request
     * @param int $hotelId ID hotel
     * @return \Illuminate\Http\JsonResponse JSON response berisi daftar ulasan dan statistik
     */
    public function publicIndex(Request $request, $hotelId)
    {
        $query = Review::with(['user', 'booking.bookingRooms.roomType', 'booking.guests'])
            ->where('hotel_id', $hotelId);

        if ($request->has('search') && $request->search != '') {
            $query->where('comment', 'like', '%'.$request->search.'%');
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
            'stats' => $stats,
        ]);
    }

    /**
     * Menampilkan daftar booking yang eligible untuk review.
     *
 * Booking eligible harus memenuhi kriteria:
 * - Status booking harus 'checked_out'
 * - Belum ada ulasan sebelumnya (doesntHave 'review')
 * - Milik user yang sedang login
 *
 * Setiap booking disertai detail kamar (bookingRooms.roomType) untuk
 * membantu pengguna memilih booking yang akan diulas.
 *
 * @param \Illuminate\Http\Request $request
 * @param int $hotelId ID hotel
 * @return \Illuminate\Http\JsonResponse JSON response berisi array booking eligible
     */
    public function eligibleBookings(Request $request, $hotelId)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please login to view eligible bookings for review.',
            ], 401);
        }

        $bookings = Booking::where('user_id', $user->id)
            ->where('hotel_id', $hotelId)
            ->where('status', 'checked_out')
            ->whereDoesntHave('review')
            ->with(['bookingRooms.roomType'])
            ->get();

        return response()->json(['status' => 'success', 'data' => $bookings]);
    }

    /**
     * Menyimpan ulasan baru beserta notifikasi low rating alert ke super admin.
     *
 * Proses:
 * 1. Validasi input: booking_id, rating (1-5), comment (optional)
 * 2. Cek eligibility: booking harus status 'checked_out', milik user,
 *    belum ada ulasan sebelumnya
 * 3. Simpan ulasan ke database
 * 4. Sync statistik rating ke tabel hotels (average_rating, total_review)
 * 5. Cek apakah rating hotel turun di bawah 3.0 dengan minimal 5 ulasan
 *    - Jika ya, kirim notifikasi ke semua super admin
 *
 * Notifikasi low rating akan mengandung:
 * - Nama hotel yang ratingnya turun
 * - Rating baru yang diterima
 * - Total ulasan saat ini
 * - Saran untuk review atau pemberian peringatan
     *
 * @param \Illuminate\Http\Request $request
 * @param int $hotelId ID hotel
 * @return \Illuminate\Http\JsonResponse JSON response berisi data ulasan yang baru disimpan
     */
    public function store(Request $request, $hotelId)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $request->user()->id)
            ->where('hotel_id', $hotelId)
            ->where('status', 'checked_out')
            ->first();

        if (! $booking) {
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
            'comment' => $request->comment,
        ]);

        $this->syncHotelRatingStats((int) $hotelId);

        // Alert Super Admin jika rating turun di bawah 3.0 dengan minimal 5 ulasan
        $hotel = Hotel::find($hotelId);
        if ($hotel && (float) $hotel->average_rating < 3.0 && (int) $hotel->total_review >= 5) {
            $superAdminIds = User::where('role', 'super_admin')->pluck('id');
            foreach ($superAdminIds as $saId) {
                $exists = Notification::where('user_id', $saId)
                    ->where('type', 'low_rating_alert')
                    ->where('title', 'like', "%{$hotel->name}%")
                    ->where('is_read', false)
                    ->exists();

                if (! $exists) {
                    Notification::create([
                        'user_id' => $saId,
                        'title' => "Low Rating Alert: {$hotel->name}",
                        'message' => "The rating for hotel {$hotel->name} has dropped to {$hotel->average_rating} from {$hotel->total_review} reviews. Consider reviewing or issuing a warning.",
                        'type' => 'low_rating_alert',
                        'is_read' => false,
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success', 'data' => $review]);
    }

    // Menampilkan daftar ulasan yang diberikan untuk hotel
    /**
     * Menampilkan daftar ulasan yang diberikan untuk hotel.
     *
 * Mengambil semua ulasan untuk hotel tertentu beserta relasi user
 * dan booking rooms. Urutan: terbaru pertama.
     *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi daftar ulasan
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $reviews = Review::where(function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id)
                ->orWhereHas('booking', function ($bookingQuery) use ($hotel) {
                    $bookingQuery->where('hotel_id', $hotel->id);
                });
        })
            ->with(['user', 'booking.bookingRooms.roomType'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reviews,
        ]);
    }

/**
 * Menanggapi ulasan dari tamu (menambahkan reply).
 *
 * Validasi input: reply (string, max 1000 karakter)
 * Cek kepemilikan review oleh user yang login dan hotel yang sesuai.
 * Tambahkan reply dan timestamp reply_at.
 */
    // Menanggapi ulasan dari tamu
    public function reply(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reply' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel tidak ditemukan'], 404);
        }

        $review = Review::where('id', $id)->where('hotel_id', $hotel->id)->first();

        if (! $review) {
            return response()->json(['status' => 'error', 'message' => 'Review not found'], 404);
        }

        $review->update([
            'reply' => $request->reply,
            'reply_at' => Carbon::now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reply sent successfully',
            'data' => $review,
        ]);
    }
}
