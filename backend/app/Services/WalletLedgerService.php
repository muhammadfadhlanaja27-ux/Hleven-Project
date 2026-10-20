<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\WalletLedgerEntry;
use Illuminate\Support\Facades\DB;

class WalletLedgerService
{
    public function recordPayment(Booking $booking): void
    {
        DB::transaction(function () use ($booking) {
            $booking = Booking::query()->with('payment')->lockForUpdate()->findOrFail($booking->id);

            if ($booking->payment?->payment_status !== 'success') {
                return;
            }

            $subtotal = (int) round((float) $booking->subtotal);
            $tax = (int) round((float) $booking->tax);
            $platformCommission = (int) round($subtotal * 0.05);
            $hotelShare = $subtotal - $platformCommission + $tax;

            $this->createEntry([
                'account_type' => 'hotel',
                'hotel_id' => $booking->hotel_id,
                'booking_id' => $booking->id,
                'entry_type' => 'booking_payment',
                'bucket' => 'held',
                'amount' => $hotelShare,
                'idempotency_key' => "booking:{$booking->id}:payment:hotel",
                'description' => "Bagian hotel dari booking {$booking->booking_code}",
            ]);

            $this->createEntry([
                'account_type' => 'platform',
                'booking_id' => $booking->id,
                'entry_type' => 'platform_commission',
                'bucket' => 'held',
                'amount' => $platformCommission,
                'idempotency_key' => "booking:{$booking->id}:payment:platform",
                'description' => "Komisi 5% platform dari booking {$booking->booking_code}",
            ]);
        });
    }

    public function releaseBooking(Booking $booking): void
    {
        DB::transaction(function () use ($booking) {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->id);

            foreach ([
                ['account_type' => 'hotel', 'hotel_id' => $booking->hotel_id],
                ['account_type' => 'platform', 'hotel_id' => null],
            ] as $account) {
                $heldAmount = $this->balance($account['account_type'], $account['hotel_id'], 'held', $booking->id);

                if ($heldAmount <= 0) {
                    continue;
                }

                $scope = $account['account_type'] === 'hotel' ? "hotel:{$booking->hotel_id}" : 'platform';

                $this->createEntry([
                    ...$account,
                    'booking_id' => $booking->id,
                    'entry_type' => 'booking_release',
                    'bucket' => 'held',
                    'amount' => -$heldAmount,
                    'idempotency_key' => "booking:{$booking->id}:release:{$scope}:held",
                    'description' => "Pelepasan saldo booking {$booking->booking_code} setelah check-out",
                ]);

                $this->createEntry([
                    ...$account,
                    'booking_id' => $booking->id,
                    'entry_type' => 'booking_release',
                    'bucket' => 'available',
                    'amount' => $heldAmount,
                    'idempotency_key' => "booking:{$booking->id}:release:{$scope}:available",
                    'description' => "Saldo booking {$booking->booking_code} tersedia setelah check-out",
                ]);
            }
        });
    }

    public function reverseBooking(Booking $booking): void
    {
        DB::transaction(function () use ($booking) {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->id);

            $originalEntries = WalletLedgerEntry::query()
                ->where('booking_id', $booking->id)
                ->whereIn('entry_type', ['booking_payment', 'platform_commission'])
                ->get();

            foreach ($originalEntries as $entry) {
                $account = [
                    'account_type' => $entry->account_type,
                    'hotel_id' => $entry->hotel_id,
                ];
                $amountToReverse = (int) $entry->amount;
                $heldBalance = max(0, $this->balance($entry->account_type, $entry->hotel_id, 'held', $booking->id));
                $fromHeld = min($amountToReverse, $heldBalance);
                $fromAvailable = $amountToReverse - $fromHeld;
                $scope = $entry->account_type === 'hotel' ? "hotel:{$entry->hotel_id}" : 'platform';

                if ($fromHeld > 0) {
                    $this->createEntry([
                        ...$account,
                        'booking_id' => $booking->id,
                        'entry_type' => 'refund_reversal',
                        'bucket' => 'held',
                        'amount' => -$fromHeld,
                        'idempotency_key' => "booking:{$booking->id}:refund:{$scope}:held",
                        'description' => "Pembalikan saldo tertahan booking {$booking->booking_code}",
                    ]);
                }

                if ($fromAvailable > 0) {
                    $this->createEntry([
                        ...$account,
                        'booking_id' => $booking->id,
                        'entry_type' => 'refund_reversal',
                        'bucket' => 'available',
                        'amount' => -$fromAvailable,
                        'idempotency_key' => "booking:{$booking->id}:refund:{$scope}:available",
                        'description' => "Pembalikan saldo tersedia booking {$booking->booking_code}",
                    ]);
                }
            }
        });
    }

    public function balance(string $accountType, ?int $hotelId, string $bucket, ?int $bookingId = null): int
    {
        return (int) WalletLedgerEntry::query()
            ->where('account_type', $accountType)
            ->where('bucket', $bucket)
            ->when($hotelId === null, fn ($query) => $query->whereNull('hotel_id'), fn ($query) => $query->where('hotel_id', $hotelId))
            ->when($bookingId !== null, fn ($query) => $query->where('booking_id', $bookingId))
            ->sum('amount');
    }

    private function createEntry(array $entry): void
    {
        WalletLedgerEntry::query()->firstOrCreate(
            ['idempotency_key' => $entry['idempotency_key']],
            [
                'account_type' => $entry['account_type'],
                'hotel_id' => $entry['hotel_id'] ?? null,
                'booking_id' => $entry['booking_id'] ?? null,
                'withdrawal_id' => $entry['withdrawal_id'] ?? null,
                'entry_type' => $entry['entry_type'],
                'bucket' => $entry['bucket'],
                'amount' => $entry['amount'],
                'currency' => 'IDR',
                'description' => $entry['description'],
            ]
        );
    }
}
