<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PayoutService
{
    public const COMMISSION_RATE = 0.05;

    /**
     * Ringkasan saldo hotel. Basis pendapatan: booking final
     * (paid/checked_in/checked_out) dengan pembayaran sukses.
     */
    public function getBalance(Hotel $hotel): array
    {
        $gross = (float) Payment::query()
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->where('bookings.hotel_id', $hotel->id)
            ->where('payments.payment_status', 'success')
            ->whereIn('bookings.status', ['paid', 'checked_in', 'checked_out'])
            ->sum('payments.gross_amount');

        $commission = round($gross * self::COMMISSION_RATE, 2);
        $net = round($gross - $commission, 2);

        $paidOut = (float) Payout::where('hotel_id', $hotel->id)
            ->where('status', 'paid')
            ->sum('amount');

        $reserved = (float) Payout::where('hotel_id', $hotel->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        return [
            'gross_revenue' => $gross,
            'platform_commission' => $commission,
            'net_revenue' => $net,
            'total_paid_out' => $paidOut,
            'pending_amount' => $reserved,
            'available_balance' => round($net - $paidOut - $reserved, 2),
        ];
    }

    public function requestPayout(Hotel $hotel, User $user, float $amount, ?string $note = null): Payout
    {
        if (! $hotel->bank_name || ! $hotel->bank_account_number) {
            throw new RuntimeException('Rekening bank hotel belum diisi. Lengkapi di profil hotel terlebih dahulu.');
        }

        if ($amount <= 0) {
            throw new RuntimeException('Nominal pencairan harus lebih dari 0.');
        }

        return DB::transaction(function () use ($hotel, $user, $amount, $note) {
            // ponytail: lock baris hotel sebagai mutex agar dua pengajuan bersamaan tak melebihi saldo
            Hotel::whereKey($hotel->id)->lockForUpdate()->first();

            $available = $this->getBalance($hotel)['available_balance'];

            if ($amount > $available) {
                throw new RuntimeException('Nominal pencairan melebihi saldo tersedia (Rp '.number_format($available, 0, ',', '.').').');
            }

            $payout = Payout::create([
                'hotel_id' => $hotel->id,
                'requested_by' => $user->id,
                'amount' => $amount,
                'status' => 'pending',
                'bank_name' => $hotel->bank_name,
                'bank_account_number' => $hotel->bank_account_number,
                'bank_account_name' => $hotel->bank_account_name,
                'note' => $note,
                'requested_at' => now(),
            ]);

            if ($hotel->admin_id) {
                Notification::create([
                    'user_id' => $hotel->admin_id,
                    'title' => 'Pengajuan Pencairan Terkirim',
                    'message' => 'Pengajuan pencairan Rp '.number_format($amount, 0, ',', '.')." untuk {$hotel->name} sedang menunggu persetujuan.",
                    'type' => 'payout_requested',
                ]);
            }

            return $payout;
        });
    }

    public function updateStatus(Payout $payout, User $admin, string $status, ?string $adminNote = null, ?string $reference = null): Payout
    {
        if (! in_array($status, ['approved', 'rejected', 'paid'], true)) {
            throw new RuntimeException('Status pencairan tidak valid.');
        }

        return DB::transaction(function () use ($payout, $admin, $status, $adminNote, $reference) {
            $payout->update([
                'status' => $status,
                'approved_by' => $admin->id,
                'admin_note' => $adminNote ?? $payout->admin_note,
                'reference' => $reference ?? $payout->reference,
                'processed_at' => now(),
            ]);

            ActivityLog::create([
                'user_id' => $admin->id,
                'activity' => 'Update Payout Status',
                'description' => "Super Admin mengubah status pencairan #{$payout->id} ({$payout->hotel->name}) menjadi {$status}.",
                'ip_address' => request()->ip(),
            ]);

            $hotel = $payout->hotel;
            if ($hotel && $hotel->admin_id) {
                $label = match ($status) {
                    'approved' => 'disetujui',
                    'rejected' => 'ditolak',
                    'paid' => 'telah ditransfer',
                };
                Notification::create([
                    'user_id' => $hotel->admin_id,
                    'title' => 'Status Pencairan Diperbarui',
                    'message' => 'Pencairan Rp '.number_format($payout->amount, 0, ',', '.')." {$label}.".($adminNote ? " Catatan: {$adminNote}" : ''),
                    'type' => 'payout_'.$status,
                ]);
            }

            return $payout->fresh();
        });
    }
}
