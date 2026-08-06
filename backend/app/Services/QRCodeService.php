<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ETicket;
use App\Models\ActivityLog;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class QRCodeService
{
    /**
     * Menghasilkan QR Code dan menyimpannya di tabel e_tickets
     */
    public function generateTicket(Booking $booking): ETicket
    {
        // Membuat string unik untuk QR Code (Misal: QR-HLV2026080001-A1B2C3D4)
        $uniqueString = 'QR-' . $booking->booking_code . '-' . strtoupper(Str::random(8));

        // Menyimpan data ke tabel e_tickets[cite: 1]
        $ticket = ETicket::firstOrCreate(
            ['booking_id' => $booking->id],
            [
                'qr_code' => $uniqueString,
                'generated_at' => now(),
            ]
        );

        // Jika ingin menyimpan gambar QR Code secara fisik ke Storage (opsional)
        // $qrImage = QrCode::format('png')->size(300)->generate($uniqueString);
        // Storage::put("public/ticket/{$uniqueString}.png", $qrImage);

        return $ticket;
    }

    /**
     * Verifikasi QR Code untuk proses Check In oleh Admin Hotel[cite: 1]
     */
    public function verifyTicket(string $qrString, $adminId): array
    {
        $ticket = ETicket::with('booking.hotel')->where('qr_code', $qrString)->first();

        if (!$ticket) {
            throw new \Exception('QR Code tidak valid atau tidak ditemukan.');
        }

        $booking = $ticket->booking;

        // Aturan BR-043: QR Code tidak dapat digunakan dua kali[cite: 1]
        if ($booking->status === 'Checked In' || $booking->status === 'Checked Out') {
            throw new \Exception('QR Code sudah digunakan untuk Check In.');
        }

        if ($booking->status !== 'Paid') {
            throw new \Exception('Booking belum lunas atau tidak valid.');
        }

        // Aturan BR-044: Status berubah menjadi Checked In setelah QR diverifikasi[cite: 1]
        DB::transaction(function () use ($booking, $adminId) {
            $booking->update(['status' => 'Checked In']);

            ActivityLog::create([
                'user_id' => $adminId,
                'activity' => 'Check In',
                'description' => "Tamu berhasil Check In menggunakan QR Code untuk Booking {$booking->booking_code}.",
                'ip_address' => request()->ip()
            ]);
        });

        return [
            'booking_code' => $booking->booking_code,
            'guest_name' => $booking->guests->first()->name ?? 'Tamu',
            'room' => $booking->bookingRooms->first()->roomType->name ?? '-',
        ];
    }
}
