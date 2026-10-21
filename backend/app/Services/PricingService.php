<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\RoomType;
use Carbon\CarbonPeriod;
use InvalidArgumentException;

class PricingService
{
    public const DEFAULT_TAX_RATE = 5.0;

    public function __construct(private RoomAvailabilityService $availability) {}

    public function taxRateForHotel(?Hotel $hotel): float
    {
        return $this->normalizeRate($hotel?->tax_rate ?? self::DEFAULT_TAX_RATE);
    }

    public function taxRateForBooking(Booking $booking): float
    {
        if ($booking->tax_rate !== null) {
            return $this->normalizeRate($booking->tax_rate);
        }

        $booking->loadMissing('hotel');

        return $this->taxRateForHotel($booking->hotel);
    }

    /**
     * @return array{subtotal: float, tax_rate: float, tax: float, grand_total: float}
     */
    public function calculate(float $subtotal, float $taxRate): array
    {
        $subtotal = round($subtotal, 2);
        $rate = $this->normalizeRate($taxRate);
        $tax = round($subtotal * $rate / 100);

        return [
            'subtotal' => $subtotal,
            'tax_rate' => $rate,
            'tax' => $tax,
            'grand_total' => round($subtotal + $tax, 2),
        ];
    }

    /**
     * @return array{subtotal: float, tax_rate: float, tax: float, grand_total: float, closed_dates: array<int, string>}
     */
    public function quote(RoomType $roomType, CarbonPeriod $period, int $qty, ?float $taxRate = null): array
    {
        $roomQuote = $this->availability->quote($roomType, $period, $qty);
        $rate = $taxRate ?? $this->taxRateForHotel($roomType->hotel);
        $totals = $this->calculate((float) $roomQuote['subtotal'], $rate);

        return array_merge($totals, ['closed_dates' => $roomQuote['closed_dates']]);
    }

    private function normalizeRate(mixed $rate): float
    {
        if (! is_numeric($rate)) {
            throw new InvalidArgumentException('Tax rate must be numeric.');
        }

        return max(0.0, min(100.0, round((float) $rate, 2)));
    }
}
