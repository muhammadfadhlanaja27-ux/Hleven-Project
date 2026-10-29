<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use App\Models\User;
use App\Services\PricingService;
use App\Services\QRCodeService;
use App\Services\RefundPolicyService;
use App\Services\WalletLedgerService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Cari booking sesuai aktor yang login: admin_hotel dibatasi ke hotelnya,
     * user biasa dibatasi ke booking miliknya sendiri. Mencegah IDOR lintas tenant.
     */
    private function findBookingForActor(Request $request, $id, array $with = []): ?Booking
    {
        $user = $request->user();
        $query = Booking::with($with)->where('id', $id);

        if ($user->role === 'admin_hotel') {
            $hotel = $user->hotel ?? $user->hotels()->first();
            if (! $hotel) {
                return null;
            }
            $query->where('hotel_id', $hotel->id);
        } elseif ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }

        return $query->first();
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();

        if (! $hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $bookings = Booking::with(['user', 'bookingRooms.roomType', 'payment', 'guests'])
            ->where('hotel_id', $hotel->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings,
        ]);
    }

    public function quote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hotel_id' => 'required|integer|exists:hotels,id',
            'room_type_id' => 'required|integer|exists:room_types,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'qty' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $roomType = RoomType::with('hotel')
            ->where('id', $request->room_type_id)
            ->where('hotel_id', $request->hotel_id)
            ->whereHas('hotel', fn ($query) => $query->where('status', 'active'))
            ->first();

        if (! $roomType || ! $roomType->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tipe kamar atau hotel ini tidak ditemukan atau sedang tidak aktif.',
            ], 422);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());
        $qty = (int) $request->qty;

        $quote = app(PricingService::class)->quote($roomType, $period, $qty);

        if (! empty($quote['closed_dates'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tanggal berikut ditutup dan tidak dapat dipesan: '.implode(', ', $quote['closed_dates']).'.',
                'closed_dates' => $quote['closed_dates'],
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'data' => array_merge($quote, [
                'nights' => max(1, $checkIn->diffInDays($checkOut)),
                'qty' => $qty,
            ]),
        ]);
    }

    public function storeManual(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_type_id' => 'required|integer|exists:room_types,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'qty' => 'required|integer|min:1',
            'adults' => 'required|integer|min:1',
            'children' => 'required|integer|between:0,32767',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'required|string|max:30',
            'payment_method' => 'required|in:cash,bank_transfer,card,unpaid',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel tidak ditemukan.'], 404);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $checkInStr = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();
        $qty = (int) $request->qty;
        $adults = (int) $request->adults;
        $children = (int) $request->children;
        $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

        DB::beginTransaction();
        try {
            $roomType = RoomType::where('id', $request->room_type_id)
                ->where('hotel_id', $hotel->id)
                ->lockForUpdate()
                ->first();

            if (! $roomType) {
                DB::rollBack();

                return response()->json(['status' => 'error', 'message' => 'Tipe kamar tidak ditemukan di hotel ini.'], 422);
            }

            if ($adults > max(1, (int) $roomType->capacity_adult) * $qty) {
                DB::rollBack();

                return response()->json(['status' => 'error', 'message' => 'Jumlah tamu dewasa melebihi kapasitas kamar.'], 422);
            }

            if ($children > max(0, (int) $roomType->capacity_child) * $qty) {
                DB::rollBack();

                return response()->json(['status' => 'error', 'message' => 'Jumlah anak melebihi kapasitas kamar.'], 422);
            }

            $bookedQty = BookingRoom::where('room_type_id', $roomType->id)
                ->whereHas('booking', function ($query) use ($checkInStr, $checkOutStr) {
                    $query->whereIn('status', ['paid', 'checked_in', 'confirmed', 'refund_pending'])
                        ->where('check_in', '<', $checkOutStr)
                        ->where('check_out', '>', $checkInStr);
                })
                ->sum('qty');
            $available = max(0, (int) ($roomType->stock ?? 10) - $bookedQty);

            if ($available < $qty) {
                DB::rollBack();

                return response()->json(['status' => 'error', 'message' => "Stok tidak cukup. Tersedia {$available} kamar."], 422);
            }

            $weekdayPrice = (float) ($roomType->weekday_price ?? $roomType->price ?? 0);
            $weekendPrice = (float) ($roomType->weekend_price ?? $weekdayPrice);

            $quote = app(PricingService::class)->quote($roomType, $period, $qty);
            if (! empty($quote['closed_dates'])) {
                DB::rollBack();

                return response()->json([
                    'status' => 'error',
                    'message' => 'Tanggal berikut ditutup dan tidak dapat dipesan: '.implode(', ', $quote['closed_dates']).'.',
                ], 422);
            }

            $subtotal = (float) $quote['subtotal'];
            $tax = (float) $quote['tax'];
            $grandTotal = (float) $quote['grand_total'];
            $bookingCode = 'HLVN-'.strtoupper(substr(md5(uniqid()), 0, 5)).'-'.Carbon::now()->format('my');
            $isPaid = $request->payment_method !== 'unpaid';

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'user_id' => $user->id,
                'hotel_id' => $hotel->id,
                'is_for_other_guest' => false,
                'guest_name' => $request->guest_name,
                'guest_email' => $request->guest_email,
                'guest_phone' => $request->guest_phone,
                'check_in' => $checkInStr,
                'check_out' => $checkOutStr,
                'total_night' => max(1, $checkIn->diffInDays($checkOut)),
                'children_count' => $children,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'tax_rate' => $quote['tax_rate'],
                'grand_total' => $grandTotal,
                'status' => $isPaid ? 'paid' : 'unpaid',
            ]);

            BookingRoom::create([
                'booking_id' => $booking->id,
                'room_type_id' => $roomType->id,
                'qty' => $qty,
                'price_per_night' => ($weekdayPrice + $weekendPrice) / 2,
                'subtotal' => $subtotal,
            ]);

            Guest::create([
                'booking_id' => $booking->id,
                'name' => $request->guest_name,
                'phone' => $request->guest_phone,
                'email' => $request->filled('guest_email') ? strtolower(trim($request->guest_email)) : null,
                'identity_number' => null,
            ]);

            foreach ($period as $date) {
                $availability = RoomAvailability::where('room_type_id', $roomType->id)
                    ->where('date', $date->format('Y-m-d'))
                    ->lockForUpdate()
                    ->first();

                if ($availability) {
                    $availability->decrement('available_stock', $qty);
                    $availability->increment('booked_room', $qty);
                } else {
                    RoomAvailability::create([
                        'room_type_id' => $roomType->id,
                        'date' => $date->format('Y-m-d'),
                        'available_stock' => max(0, (int) ($roomType->stock ?? 10) - $qty),
                        'booked_room' => $qty,
                    ]);
                }
            }

            Payment::create([
                'booking_id' => $booking->id,
                'payment_method' => $isPaid ? $request->payment_method : null,
                'payment_status' => $isPaid ? 'success' : 'pending',
                'gross_amount' => $grandTotal,
                'order_id' => $bookingCode,
                'paid_at' => $isPaid ? Carbon::now() : null,
            ]);

            DB::commit();

            $booking->load(['user', 'bookingRooms.roomType', 'payment', 'guests']);

            // Send email if paid
            if ($isPaid) {
                try {
                    app(QRCodeService::class)->generateTicket($booking);
                    $booking->load('eTicket');
                    $recipient = $booking->guests->first()->email ?? $booking->user->email;
                    if ($recipient) {
                        Mail::to($recipient)->send(new BookingConfirmedMail($booking));
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to send manual booking confirmation: '.$e->getMessage());
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Booking manual berhasil dibuat.',
                'data' => $booking,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 'error', 'message' => 'Gagal membuat booking: '.$e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $booking = $this->findBookingForActor(
            $request,
            $id,
            ['user', 'bookingRooms.roomType', 'payment', 'guests', 'hotel']
        );

        if (! $booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $booking,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $internalUpdate = $request->attributes->get('internal_booking_status_update') === true;

        if (! $internalUpdate && $request->user()->role !== 'admin_hotel') {
            return response()->json(['status' => 'error', 'message' => 'Hanya admin hotel yang dapat mengubah status booking.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,unpaid,paid,checked_in,checked_out,cancelled,expired,refunded,refund_pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = Booking::with(['bookingRooms'])->find($id);

        if (! $booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        if ($request->user()->role === 'admin_hotel') {
            if (! $request->user()->hotels()->whereKey($booking->hotel_id)->exists()) {
                return response()->json(['status' => 'error', 'message' => 'Booking ini bukan milik hotel Anda.'], 403);
            }
        } elseif ($internalUpdate && $booking->user_id !== $request->user()->id) {
            return response()->json(['status' => 'error', 'message' => 'Booking ini bukan milik Anda.'], 403);
        }

        $oldStatus = $booking->status;
        $newStatus = $request->status;

        if ($newStatus === 'checked_out' && $oldStatus !== 'checked_in') {
            return response()->json(['status' => 'error', 'message' => 'Booking hanya dapat check-out setelah check-in.'], 422);
        }

        DB::beginTransaction();
        try {
            $cancelStatuses = ['cancelled', 'expired', 'refunded'];
            $activeStatuses = ['pending', 'unpaid', 'paid', 'confirmed', 'checked_in', 'refund_pending'];

            if (in_array($newStatus, $cancelStatuses) && in_array($oldStatus, $activeStatuses)) {
                $checkIn = Carbon::parse($booking->check_in);
                $checkOut = Carbon::parse($booking->check_out);
                $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

                foreach ($booking->bookingRooms as $bRoom) {
                    foreach ($period as $date) {
                        $dateStr = $date->format('Y-m-d');
                        $avail = RoomAvailability::where('room_type_id', $bRoom->room_type_id)
                            ->where(function ($q) use ($dateStr) {
                                $q->where('date', $dateStr)
                                    ->orWhere('date', $dateStr.' 00:00:00');
                            })
                            ->first();

                        if ($avail) {
                            $avail->increment('available_stock', $bRoom->qty);
                            $avail->decrement('booked_room', $bRoom->qty);
                        }
                    }
                }
            }

            $booking->update(['status' => $newStatus]);

            if ($newStatus === 'checked_out') {
                app(WalletLedgerService::class)->releaseBooking($booking);
            } elseif ($newStatus === 'refunded' && $booking->payment?->payment_status === 'success') {
                app(WalletLedgerService::class)->reverseBooking($booking);
            } elseif ($newStatus === 'cancelled' && $booking->payment?->payment_status === 'success') {
                app(WalletLedgerService::class)->releaseForfeitedBooking($booking);
            }

            // Saat admin menandai booking selesai (checked out), ajukan user menulis ulasan.
            // Ulasan hanya boleh ditulis setelah checkout (lihat ReviewController::eligibleBookings).
            if ($newStatus === 'checked_out' && $booking->user_id && ! $booking->review()->exists()) {
                Notification::create([
                    'user_id' => $booking->user_id,
                    'title' => 'Tulis Ulasan Anda',
                    'message' => 'Bagaimana pengalaman menginap Anda di '.($booking->hotel->name ?? 'hotel').
                                ' (booking '.$booking->booking_code.')? Bagikan ulasan Anda!',
                    'type' => 'review_request',
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Booking status updated successfully',
                'data' => $booking,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui status: '.$e->getMessage(),
            ], 500);
        }
    }

    public function cancelBooking(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with(['bookingRooms.roomType', 'payment'])->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (! $booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        $blocked = ['cancelled', 'expired', 'refunded', 'refund_pending', 'checked_in', 'checked_out'];
        if (in_array($booking->status, $blocked)) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak dapat dibatalkan atau sedang dalam proses refund'], 400);
        }

        if (in_array($booking->status, ['unpaid', 'pending'])) {
            $request->merge(['status' => 'cancelled']);

            return $this->updateStatusInternally($request, $booking->id);
        }

        if (in_array($booking->status, ['paid', 'confirmed'])) {
            $refundPolicy = app(RefundPolicyService::class)->evaluate($booking);

            if (! $refundPolicy['is_refundable']) {
                return $this->cancelWithoutRefund(
                    $request,
                    $booking,
                    'Pesanan dibatalkan. Kamar non-refundable — dana hangus tidak dikembalikan.'
                );
            }

            if ($refundPolicy['is_within_cutoff']) {
                return $this->cancelWithoutRefund(
                    $request,
                    $booking,
                    'Pembatalan berhasil. Dana tidak dapat dikembalikan karena pembatalan dilakukan dalam '.$refundPolicy['refund_cutoff_hours'].' jam sebelum check-in.'
                );
            }

            $request->merge(['status' => 'refunded']);
            $response = $this->updateStatusInternally($request, $booking->id);

            if ($response->getStatusCode() === 200) {
                Notification::create([
                    'user_id' => $booking->user_id,
                    'title' => 'Refund Disetujui Otomatis',
                    'message' => "Pembatalan booking {$booking->booking_code} dilakukan di luar batas {$refundPolicy['refund_cutoff_hours']} jam sebelum check-in. Refund disetujui otomatis; pengembalian dana diproses terpisah.",
                    'type' => 'refund',
                    'is_read' => false,
                ]);

                $hotelAdminId = $booking->hotel?->admin_id;
                if ($hotelAdminId) {
                    Notification::create([
                        'user_id' => $hotelAdminId,
                        'title' => 'Booking Dibatalkan',
                        'message' => "Booking {$booking->booking_code} dibatalkan dan refund disetujui otomatis.",
                        'type' => 'refund',
                        'is_read' => false,
                    ]);
                }

                $data = json_decode($response->getContent(), true);
                $data['message'] = "Refund disetujui otomatis karena pembatalan dilakukan di luar batas {$refundPolicy['refund_cutoff_hours']} jam sebelum check-in. Pengembalian dana diproses terpisah.";
                $response->setData($data);
            }

            return $response;
        }

        return response()->json(['status' => 'error', 'message' => 'Booking tidak dapat dibatalkan'], 400);
    }

    private function cancelWithoutRefund(Request $request, Booking $booking, string $message)
    {
        $request->merge(['status' => 'cancelled']);
        $response = $this->updateStatusInternally($request, $booking->id);

        if ($response->getStatusCode() === 200) {
            Notification::create([
                'user_id' => $booking->user_id,
                'title' => 'Pembatalan Tanpa Refund',
                'message' => "Booking {$booking->booking_code} dibatalkan. {$message}",
                'type' => 'refund',
                'is_read' => false,
            ]);

            $hotelAdminId = $booking->hotel?->admin_id;
            if ($hotelAdminId) {
                Notification::create([
                    'user_id' => $hotelAdminId,
                    'title' => 'Booking Dibatalkan Tanpa Refund',
                    'message' => "Booking {$booking->booking_code} dibatalkan oleh pengguna. {$message}",
                    'type' => 'refund',
                    'is_read' => false,
                ]);
            }

            $data = json_decode($response->getContent(), true);
            $data['message'] = $message;
            $response->setData($data);
        }

        return $response;
    }

    public function handleRefundApproval(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = $this->findBookingForActor($request, $id);

        if (! $booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        if ($booking->status !== 'refund_pending') {
            return response()->json(['status' => 'error', 'message' => 'Pesanan ini tidak sedang dalam pengajuan refund'], 400);
        }

        if ($request->action === 'approve') {
            $request->merge(['status' => 'refunded']);

            $response = $this->updateStatusInternally($request, $booking->id);
            if ($response->getStatusCode() === 200) {
                Notification::create([
                    'user_id' => $booking->user_id,
                    'title' => 'Refund Disetujui',
                    'message' => "Pengajuan refund untuk booking {$booking->booking_code} telah disetujui hotel. Pengembalian dana diproses terpisah.",
                    'type' => 'refund',
                    'is_read' => false,
                ]);
            }

            return $response;
        } else {
            $booking->update(['status' => 'paid']);
            Notification::create([
                'user_id' => $booking->user_id,
                'title' => 'Refund Ditolak',
                'message' => "Pengajuan refund untuk booking {$booking->booking_code} ditolak. Status booking kembali Paid.",
                'type' => 'refund',
                'is_read' => false,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengajuan refund ditolak. Status pesanan kembali menjadi Paid.',
                'data' => $booking,
            ]);
        }
    }

    private function updateStatusInternally(Request $request, int $bookingId)
    {
        $request->attributes->set('internal_booking_status_update', true);

        return $this->updateStatus($request, $bookingId);
    }

    public function extendBooking(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:days',
            'duration' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $booking = $this->findBookingForActor($request, $id, ['bookingRooms.roomType', 'payment', 'hotel', 'guests']);

        if (! $booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        $allowedStatuses = ['paid', 'confirmed', 'checked_in'];
        if (! in_array(strtolower($booking->status), $allowedStatuses)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya pesanan yang lunas (Paid / Confirmed / Checked In) yang dapat diperpanjang.',
            ], 400);
        }

        $duration = (int) $request->duration;
        $notes = $request->notes;

        $firstBookingRoom = $booking->bookingRooms->first();
        $roomType = $firstBookingRoom?->roomType;
        $qty = $booking->bookingRooms->sum('qty') ?: 1;

        $basePrice = (float) ($firstBookingRoom?->price_per_night ?? $roomType?->weekday_price ?? 350000);
        $pricing = app(PricingService::class);
        $extensionTaxRate = $pricing->taxRateForBooking($booking);

        DB::beginTransaction();
        try {
            $extensionSubtotal = $basePrice * $duration * $qty;
            $extensionTotals = $pricing->calculate($extensionSubtotal, $extensionTaxRate);
            $extensionLabel = "[Perpanjang +{$duration} Hari]";

            $currentCheckOut = Carbon::parse($booking->check_out);
            $newCheckOut = $currentCheckOut->copy()->addDays($duration);
            $period = CarbonPeriod::create($currentCheckOut, $newCheckOut->copy()->subDay());

            foreach ($booking->bookingRooms as $bRoom) {
                $totalPhysicalStock = max(1, (int) ($bRoom->roomType?->stock ?? 10));

                foreach ($period as $date) {
                    $dateStr = $date->format('Y-m-d');
                    $avail = RoomAvailability::where('room_type_id', $bRoom->room_type_id)
                        ->where('date', $dateStr)
                        ->lockForUpdate()
                        ->first();

                    if ($avail) {
                        $avail->decrement('available_stock', $bRoom->qty);
                        $avail->increment('booked_room', $bRoom->qty);
                    } else {
                        RoomAvailability::create([
                            'room_type_id' => $bRoom->room_type_id,
                            'date' => $dateStr,
                            'available_stock' => max(0, $totalPhysicalStock - $bRoom->qty),
                            'booked_room' => $bRoom->qty,
                        ]);
                    }
                }
            }

            $booking->check_out = $newCheckOut->toDateString();
            $booking->total_night = ($booking->total_night ?? 1) + $duration;

            $addedTax = (float) $extensionTotals['tax'];
            $addedGrandTotal = (float) $extensionTotals['grand_total'];

            $booking->subtotal = ($booking->subtotal ?? 0) + $extensionTotals['subtotal'];
            $booking->tax = ($booking->tax ?? 0) + $addedTax;
            $booking->grand_total = ($booking->grand_total ?? 0) + $addedGrandTotal;

            $existingNote = $booking->special_request ?? '';
            $newNote = trim("{$existingNote} {$extensionLabel} ".($notes ? "({$notes})" : ''));
            $booking->special_request = $newNote;

            $booking->save();

            if ($booking->payment) {
                $booking->payment->gross_amount = $booking->grand_total;
                $booking->payment->save();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Booking berhasil diperpanjang (+{$duration} Hari).",
                'data' => $booking->fresh(['user', 'bookingRooms.roomType', 'payment', 'guests']),
                'extension_summary' => [
                    'type' => 'days',
                    'duration' => $duration,
                    'subtotal_added' => $extensionSubtotal,
                    'tax_added' => $addedTax,
                    'grand_total_added' => $addedGrandTotal,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperpanjang booking: '.$e->getMessage(),
            ], 500);
        }
    }

    public function downloadETicket(Request $request, $id)
    {
        $user = $request->user();
        $query = Booking::with(['hotel', 'bookingRooms.roomType', 'guests', 'user'])->where('id', $id);

        if ($user) {
            $query->where('user_id', $user->id);
        }

        $booking = $query->first();

        if (! $booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan'], 404);
        }

        $validStatuses = ['paid', 'confirmed', 'checked_in', 'checked_out'];
        if (! in_array(strtolower($booking->status), $validStatuses)) {
            return response()->json([
                'status' => 'error',
                'message' => 'E-Tiket hanya tersedia untuk pemesanan yang telah lunas. Status saat ini: '.$booking->status,
            ], 400);
        }

        $pdf = Pdf::loadView('pdf.e-ticket', compact('booking'));

        return $pdf->download("E-Ticket-{$booking->booking_code}.pdf");
    }

    public function userBookings(Request $request)
    {
        $user = $request->user();

        $bookings = Booking::with(['hotel', 'bookingRooms.roomType.photos', 'bookingRooms.roomType', 'payment', 'review', 'guests'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $refundPolicy = app(RefundPolicyService::class);

        $bookings = $bookings->map(fn (Booking $booking) => array_merge(
            $booking->toArray(),
            $refundPolicy->evaluate($booking)
        ));

        return response()->json([
            'status' => 'success',
            'data' => $bookings,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hotel_id' => 'required|integer|exists:hotels,id',
            'room_type_id' => 'required|integer|exists:room_types,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'qty' => 'required|integer|min:1',
            'adults' => 'nullable|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'is_for_other_guest' => 'nullable|boolean',
            'guest_name' => 'required_if:is_for_other_guest,true|nullable|string|max:255',
            'guest_email' => 'required_if:is_for_other_guest,true|nullable|email|max:255',
            'guest_phone' => 'required_if:is_for_other_guest,true|nullable|string|max:30',
            'guest_identity' => 'nullable|string|max:50',
            'special_request' => 'nullable|string',
            'special_requests' => 'nullable|string',
            'guests' => 'nullable|array',
            'guests.*.name' => 'required_with:guests|string|max:255',
            'guests.*.phone' => 'nullable|string|max:30',
            'guests.*.identity_number' => 'nullable|string|max:50',
            'idempotency_key' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $qty = (int) $request->qty;
        $adults = (int) ($request->adults ?? 1);
        $children = (int) ($request->children ?? 0);
        $specialNotes = $request->special_requests ?? $request->special_request ?? null;

        // Guest checkout: data pemesan diambil dari payload, sedangkan user login
        // tetap boleh memesan untuk orang lain.
        $guestName = $request->guest_name ?: ($user->name ?? $request->booker_name);
        $guestEmail = $request->guest_email ?: ($user->email ?? $request->booker_email);
        $guestPhone = $request->guest_phone ?: ($user->phone ?? $request->booker_phone);
        $isForOtherGuest = (bool) $request->is_for_other_guest
            || ($request->filled('guest_name') && (! $user || $request->guest_name !== $user->name));

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $checkInStr = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();
        $totalNight = max(1, $checkIn->diffInDays($checkOut));
        $period = CarbonPeriod::create($checkIn, $checkOut->copy()->subDay());

        $idempotencyKey = $request->input('idempotency_key');
        if ($idempotencyKey) {
            $existing = Booking::with(['hotel', 'bookingRooms.roomType', 'payment', 'guests'])
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existing) {
                return $this->duplicateBookingResponse($existing);
            }
        }

        $duplicateQuery = Booking::with(['hotel', 'bookingRooms.roomType', 'payment', 'guests'])
            ->where('hotel_id', $request->hotel_id)
            ->whereDate('check_in', $checkInStr)
            ->whereDate('check_out', $checkOutStr)
            ->whereIn('status', ['pending', 'unpaid', 'paid', 'checked_in', 'confirmed']);

        if ($user) {
            $duplicateQuery->where('user_id', $user->id);
        } else {
            $duplicateQuery->whereNull('user_id')->where('guest_email', $guestEmail);
        }

        $duplicate = $duplicateQuery
            ->whereHas('bookingRooms', function ($query) use ($request, $qty) {
                $query->where('room_type_id', $request->room_type_id)->where('qty', $qty);
            })
            ->latest()
            ->first();

        if ($duplicate) {
            return $this->duplicateBookingResponse($duplicate);
        }

        DB::beginTransaction();
        try {
            $queryRoomType = RoomType::where('id', $request->room_type_id)
                ->where('hotel_id', $request->hotel_id)
                ->lockForUpdate();

            if (Schema::hasColumn('room_types', 'is_active')) {
                $queryRoomType->where('is_active', true);
            }

            $queryRoomType->whereHas('hotel', function ($query) {
                $query->where('status', 'active');
            });

            $roomType = $queryRoomType->first();

            if (! $roomType) {
                DB::rollBack();

                return response()->json([
                    'status' => 'error',
                    'message' => 'Tipe kamar atau hotel ini tidak ditemukan, sedang tidak aktif, atau ID tidak valid.',
                ], 422);
            }

            $capacityAdult = max(1, (int) ($roomType->capacity_adult ?? 2));
            $capacityChild = max(0, (int) ($roomType->capacity_child ?? 2));
            
            $maxAdultAllowed = $capacityAdult * $qty;
            $maxTotalAllowed = ($capacityAdult + $capacityChild) * $qty;

            if ($adults > $maxAdultAllowed || ($adults + $children) > $maxTotalAllowed) {
                DB::rollBack();
                $minQtyNeeded = (int) ceil(($adults + $children) / max(1, ($capacityAdult + $capacityChild)));
                $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $adults);

                return response()->json([
                    'status' => 'error',
                    'message' => "Untuk {$adults} dewasa dan {$children} anak, Anda membutuhkan minimal {$minQtyNeeded} kamar. Silakan tambah jumlah kamar.",
                    'suggestions' => $suggestions,
                ], 422);
            }

            $totalPhysicalStock = max(1, (int) ($roomType->stock ?? 10));

            $bookedQtyInPeriod = BookingRoom::where('room_type_id', $roomType->id)
                ->whereHas('booking', function ($query) use ($checkInStr, $checkOutStr) {
                    $query->whereIn('status', ['unpaid', 'paid', 'checked_in', 'pending', 'confirmed', 'refund_pending'])
                        ->where('check_in', '<', $checkOutStr)
                        ->where('check_out', '>', $checkInStr);
                })
                ->sum('qty');

            $remainingStockDirect = max(0, $totalPhysicalStock - $bookedQtyInPeriod);

            if ($remainingStockDirect < $qty) {
                DB::rollBack();
                $suggestions = $this->getAlternativeRooms($request->hotel_id, $roomType->id, $checkInStr, $checkOutStr, $adults);

                return response()->json([
                    'status' => 'error',
                    'message' => "Jumlah kamar yang Anda pilih ({$qty} kamar) melebihi stok yang tersedia ({$remainingStockDirect} kamar).",
                    'suggestions' => $suggestions,
                ], 422);
            }

            $weekdayPrice = $roomType->weekday_price ?? $roomType->price ?? 0;
            $weekendPrice = $roomType->weekend_price ?? $weekdayPrice;

            $quote = app(PricingService::class)->quote($roomType, $period, $qty);
            if (! empty($quote['closed_dates'])) {
                DB::rollBack();

                return response()->json([
                    'status' => 'error',
                    'message' => 'Tanggal berikut ditutup dan tidak dapat dipesan: '.implode(', ', $quote['closed_dates']).'.',
                ], 422);
            }

            $subtotal = (float) $quote['subtotal'];
            $tax = (float) $quote['tax'];
            $grandTotal = (float) $quote['grand_total'];

            $bookingCode = 'HLVN-'.strtoupper(substr(md5(uniqid()), 0, 5)).'-'.Carbon::now()->format('my');

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'idempotency_key' => $idempotencyKey,
                'user_id' => $user?->id,
                'hotel_id' => $request->hotel_id,
                'is_for_other_guest' => $isForOtherGuest,
                'guest_name' => $guestName,
                'guest_email' => $guestEmail,
                'guest_phone' => $guestPhone,
                'check_in' => $checkInStr,
                'check_out' => $checkOutStr,
                'total_night' => $totalNight,
                'children_count' => $children,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'tax_rate' => $quote['tax_rate'],
                'grand_total' => $grandTotal,
                'special_request' => $specialNotes,
                'status' => 'unpaid',
            ]);

            BookingRoom::create([
                'booking_id' => $booking->id,
                'room_type_id' => $roomType->id,
                'qty' => $qty,
                'price_per_night' => ($weekdayPrice + $weekendPrice) / 2,
                'subtotal' => $subtotal,
            ]);

            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                $avail = RoomAvailability::where('room_type_id', $roomType->id)
                    ->where('date', $dateStr)
                    ->lockForUpdate()
                    ->first();

                if ($avail) {
                    $avail->decrement('available_stock', $qty);
                    $avail->increment('booked_room', $qty);
                } else {
                    RoomAvailability::create([
                        'room_type_id' => $roomType->id,
                        'date' => $dateStr,
                        'available_stock' => max(0, $totalPhysicalStock - $qty),
                        'booked_room' => $qty,
                    ]);
                }
            }

            Guest::create([
                'booking_id' => $booking->id,
                'name' => $guestName,
                'email' => $guestEmail ? strtolower(trim($guestEmail)) : null,
                'phone' => $guestPhone,
                'identity_number' => $request->guest_identity ?? '-',
            ]);

            if ($request->has('guests') && is_array($request->guests)) {
                foreach ($request->guests as $g) {
                    Guest::create([
                        'booking_id' => $booking->id,
                        'name' => $g['name'],
                        'phone' => $g['phone'] ?? null,
                        'identity_number' => $g['identity_number'] ?? '-',
                    ]);
                }
            }

            $payment = Payment::create([
                'booking_id' => $booking->id,
                'payment_status' => 'pending',
                'gross_amount' => $grandTotal,
                'order_id' => $bookingCode,
                'expired_at' => Carbon::now()->addMinutes(15),
            ]);

            DB::commit();

            $booking->load(['hotel', 'bookingRooms.roomType.photos', 'payment', 'guests']);

            return response()->json([
                'status' => 'success',
                'message' => 'Booking berhasil dibuat. Silakan lakukan pembayaran.',
                'data' => [
                    'booking' => $booking,
                    'payment' => $payment,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat booking: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Response untuk booking yang terdeteksi duplikat (idempotency key atau retry identik).
     */
    private function duplicateBookingResponse(Booking $booking)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Booking sudah dibuat sebelumnya.',
            'duplicate' => true,
            'data' => [
                'booking' => $booking,
                'payment' => $booking->payment,
                'token' => null,
            ],
        ], 200);
    }

    private function getAlternativeRooms($hotelId, $currentRoomTypeId, $checkInStr, $checkOutStr, $adults)
    {
        $hasIsActive = Schema::hasColumn('room_types', 'is_active');

        $sameHotelQuery = RoomType::where('hotel_id', $hotelId)
            ->where('id', '!=', $currentRoomTypeId);

        if ($hasIsActive) {
            $sameHotelQuery->where('is_active', true);
        }

        $sameHotelRooms = $sameHotelQuery->with(['hotel.city', 'photos', 'facilities'])
            ->whereHas('hotel', function ($q) {
                $q->where('status', 'active');
            })
            ->where('capacity_adult', '>=', $adults)
            ->get()
            ->filter(function ($r) use ($checkInStr, $checkOutStr) {
                $booked = BookingRoom::where('room_type_id', $r->id)
                    ->whereHas('booking', function ($q) use ($checkInStr, $checkOutStr) {
                        $q->whereIn('status', ['unpaid', 'paid', 'pending', 'confirmed', 'checked_in', 'refund_pending'])
                            ->where('check_in', '<', $checkOutStr)
                            ->where('check_out', '>', $checkInStr);
                    })->sum('qty');

                return (($r->stock ?? 10) - $booked) > 0;
            });

        if ($sameHotelRooms->isNotEmpty()) {
            return [
                'type' => 'same_hotel',
                'rooms' => $sameHotelRooms->values()->map(function (RoomType $room) {
                    return $this->alternativeRoomDetails($room, null);
                }),
            ];
        }

        $currentHotel = Hotel::with('city')->find($hotelId);
        $cityId = $currentHotel?->city_id;

        $otherHotelQuery = RoomType::query();
        if ($hasIsActive) {
            $otherHotelQuery->where('is_active', true);
        }

        $otherHotelRooms = $otherHotelQuery->with(['hotel.city', 'photos', 'facilities'])
            ->whereHas('hotel', function ($q) use ($cityId, $hotelId) {
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
                        $q->whereIn('status', ['unpaid', 'paid', 'pending', 'confirmed', 'checked_in', 'refund_pending'])
                            ->where('check_in', '<', $checkOutStr)
                            ->where('check_out', '>', $checkInStr);
                    })->sum('qty');

                return (($r->stock ?? 10) - $booked) > 0;
            });

        $recommendations = $otherHotelRooms->map(function (RoomType $room) use ($currentHotel) {
            $distance = $this->distanceBetweenHotels($currentHotel, $room->hotel);

            return $this->alternativeRoomDetails($room, $distance);
        })->sortBy(fn (array $room) => $room['distance_km'] ?? INF)->values();

        return [
            'type' => 'other_hotels_in_city',
            'rooms' => $recommendations,
        ];
    }

    private function alternativeRoomDetails(RoomType $room, ?float $distanceKm): array
    {
        return array_merge($room->toArray(), [
            'hotel' => $room->hotel ? [
                'id' => $room->hotel->id,
                'name' => $room->hotel->name,
                'address' => $room->hotel->address,
                'city' => $room->hotel->city?->city,
            ] : null,
            'distance_km' => $distanceKm,
        ]);
    }

    private function distanceBetweenHotels(?Hotel $origin, ?Hotel $destination): ?float
    {
        if (! $origin || ! $destination
            || ! is_numeric($origin->latitude) || ! is_numeric($origin->longitude)
            || ! is_numeric($destination->latitude) || ! is_numeric($destination->longitude)) {
            return null;
        }

        $latitudeDelta = deg2rad((float) $destination->latitude - (float) $origin->latitude);
        $longitudeDelta = deg2rad((float) $destination->longitude - (float) $origin->longitude);
        $originLatitude = deg2rad((float) $origin->latitude);
        $destinationLatitude = deg2rad((float) $destination->latitude);

        $a = sin($latitudeDelta / 2) ** 2
            + cos($originLatitude) * cos($destinationLatitude) * sin($longitudeDelta / 2) ** 2;

        return round(6371 * 2 * asin(sqrt(min(1, $a))), 1);
    }
}
