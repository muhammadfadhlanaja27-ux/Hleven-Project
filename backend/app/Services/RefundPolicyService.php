<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\CarbonImmutable;
use DateTimeInterface;

class RefundPolicyService
{
    public function checkInAt(Booking $booking): CarbonImmutable
    {
        $date = $booking->check_in instanceof DateTimeInterface
            ? $booking->check_in->format('Y-m-d')
            : CarbonImmutable::parse($booking->check_in)->format('Y-m-d');

        $hour = str_pad((string) config('hleven.checkin_hour', 14), 2, '0', STR_PAD_LEFT);

        return CarbonImmutable::parse(
            "{$date} {$hour}:00:00",
            config('hleven.refund_timezone', 'Asia/Jakarta')
        );
    }

    public function cutoffAt(Booking $booking): CarbonImmutable
    {
        return $this->checkInAt($booking)
            ->subHours((int) config('hleven.refund_cutoff_hours', 24));
    }

    public function isWithinCutoff(Booking $booking, ?CarbonImmutable $now = null): bool
    {
        $now ??= $this->now();

        return $now->greaterThanOrEqualTo($this->cutoffAt($booking));
    }

    public function allRoomsRefundable(Booking $booking): bool
    {
        $rooms = $booking->relationLoaded('bookingRooms')
            ? $booking->bookingRooms
            : $booking->bookingRooms()->with('roomType')->get();

        if ($rooms->isEmpty()) {
            return true;
        }

        return $rooms->every(
            fn ($bookingRoom) => (bool) ($bookingRoom->roomType?->is_refundable ?? true)
        );
    }

    /**
     * @return array{
     *     is_refundable: bool,
     *     is_within_cutoff: bool,
     *     can_refund: bool,
     *     refund_deadline: string,
     *     check_in_at: string,
     *     refund_block_reason: string|null,
     *     refund_cutoff_hours: int
     * }
     */
    public function evaluate(Booking $booking): array
    {
        $isRefundable = $this->allRoomsRefundable($booking);
        $isWithinCutoff = $this->isWithinCutoff($booking);

        return [
            'is_refundable' => $isRefundable,
            'is_within_cutoff' => $isWithinCutoff,
            'can_refund' => $isRefundable && ! $isWithinCutoff,
            'refund_deadline' => $this->cutoffAt($booking)->toIso8601String(),
            'check_in_at' => $this->checkInAt($booking)->toIso8601String(),
            'refund_block_reason' => ! $isRefundable
                ? 'non_refundable'
                : ($isWithinCutoff ? 'cutoff' : null),
            'refund_cutoff_hours' => (int) config('hleven.refund_cutoff_hours', 24),
        ];
    }

    private function now(): CarbonImmutable
    {
        return CarbonImmutable::now(config('hleven.refund_timezone', 'Asia/Jakarta'));
    }
}
