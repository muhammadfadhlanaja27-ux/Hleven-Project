<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookingRoom;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomCalendarController extends Controller
{
    private const ACTIVE_STATUSES = ['pending', 'unpaid', 'paid', 'confirmed', 'checked_in', 'refund_pending'];

    private function findRoomForUser(Request $request, $id): ?RoomType
    {
        $user = $request->user();
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first()) : null;

        if (! $hotel) {
            return null;
        }

        return RoomType::where('hotel_id', $hotel->id)->find($id);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $room = $this->findRoomForUser($request, $id);

        if (! $room) {
            return response()->json(['success' => false, 'message' => 'Kamar tidak ditemukan.'], 404);
        }

        $request->validate(['month' => 'nullable|date_format:Y-m']);
        $month = $request->query('month') ?: now()->format('Y-m');

        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $overrides = RoomAvailability::where('room_type_id', $room->id)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn ($row) => Carbon::parse($row->date)->format('Y-m-d'));

        $bookedByDate = $this->bookedQtyByDate($room->id, $start, $end);
        $stock = (int) ($room->stock ?? 0);

        $days = [];
        foreach (CarbonPeriod::create($start, $end) as $date) {
            $key = $date->format('Y-m-d');
            $override = $overrides->get($key);
            $basePrice = (float) ($date->isWeekend() ? $room->weekend_price : $room->weekday_price);
            $booked = $bookedByDate[$key] ?? 0;

            $days[] = [
                'date' => $key,
                'is_weekend' => $date->isWeekend(),
                'base_price' => $basePrice,
                'price' => $override && $override->price !== null ? (float) $override->price : $basePrice,
                'is_closed' => (bool) ($override->is_closed ?? false),
                'booked_room' => $booked,
                'available_stock' => max(0, $stock - $booked),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Kalender kamar berhasil dimuat.',
            'data' => [
                'room_type' => [
                    'id' => $room->id,
                    'name' => $room->name,
                    'weekday_price' => (float) $room->weekday_price,
                    'weekend_price' => (float) $room->weekend_price,
                    'stock' => $stock,
                ],
                'month' => $start->format('Y-m'),
                'days' => $days,
            ],
        ], 200);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $room = $this->findRoomForUser($request, $id);

        if (! $room) {
            return response()->json(['success' => false, 'message' => 'Kamar tidak ditemukan.'], 404);
        }

        $data = $request->validate([
            'days' => 'required|array|min:1',
            'days.*.date' => 'required|date_format:Y-m-d',
            'days.*.price' => 'nullable|numeric|min:0',
            'days.*.is_closed' => 'boolean',
        ]);

        foreach ($data['days'] as $day) {
            $availability = RoomAvailability::firstOrNew([
                'room_type_id' => $room->id,
                'date' => $day['date'],
            ]);

            if (! $availability->exists) {
                $availability->available_stock = (int) ($room->stock ?? 0);
                $availability->booked_room = 0;
            }

            $availability->price = $day['price'] ?? null;
            $availability->is_closed = $day['is_closed'] ?? false;
            $availability->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Kalender berhasil diperbarui.',
            'data' => ['updated' => count($data['days'])],
        ], 200);
    }

    /**
     * @return array<string, int>
     */
    private function bookedQtyByDate(int $roomTypeId, Carbon $start, Carbon $end): array
    {
        $rows = BookingRoom::where('room_type_id', $roomTypeId)
            ->whereHas('booking', function ($q) use ($start, $end) {
                $q->whereIn('status', self::ACTIVE_STATUSES)
                    ->where('check_in', '<=', $end->toDateString())
                    ->where('check_out', '>', $start->toDateString());
            })
            ->with('booking:id,check_in,check_out')
            ->get(['booking_id', 'qty']);

        $totals = [];
        foreach ($rows as $row) {
            $booking = $row->booking;
            if (! $booking) {
                continue;
            }
            $cursor = Carbon::parse($booking->check_in)->max($start);
            $last = Carbon::parse($booking->check_out)->min($end->copy()->addDay());
            while ($cursor->lt($last)) {
                $key = $cursor->format('Y-m-d');
                $totals[$key] = ($totals[$key] ?? 0) + $row->qty;
                $cursor->addDay();
            }
        }

        return $totals;
    }
}
