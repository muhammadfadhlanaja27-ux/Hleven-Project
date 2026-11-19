<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource untuk merformat data pemesanan (booking).
 *
 * Mengubah data model Booking menjadi array JSON yang bisa dikonsumsi
 * oleh frontend. Resource ini mengontrol field-field apa yang akan
 * tampil dalam response, termasuk detail booking, pemesan, tamu mengin,
 * dan hotel.
 *
 * Field yang di-return:
 * - id, booking_code, status: identitas dan status pemesanan
 * - check_in/check_out: tanggal mengin dan check-out (format Y-m-d)
 * - total_night, subtotal, tax, grand_total: detail biaya
 * - tax_rate: tingkat pajak (nullable)
 * - special_request: permintaan khusus
 * - is_for_other_guest: apakah pemesanan untuk tamu lain
 * - booker: detail pemesan (terdaftar atau tidak)
 * - staying_guest: detail tamu mengin
 * - hotel: detail hotel (hanya jika sudah di-load via withLoaded)
 * - rooms: daftar kamar (hanya jika sudah di-load via bookingRooms)
 * - created_at: timestamp pembuatan (format ISO8601)
 *
 * @param \Illuminate\Http\Request $request
 * @return array Data booking yang diformat untuk response API
     */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'status' => $this->status,
            'check_in' => $this->check_in?->format('Y-m-d'),
            'check_out' => $this->check_out?->format('Y-m-d'),
            'total_night' => $this->total_night,
            'subtotal' => (float) $this->subtotal,
            'tax' => (float) $this->tax,
            'tax_rate' => $this->tax_rate !== null ? (float) $this->tax_rate : null,
            'grand_total' => (float) $this->grand_total,
            'special_request' => $this->special_request,
            'is_for_other_guest' => (bool) $this->is_for_other_guest,

            'booker' => [
                'is_registered' => ! is_null($this->user_id),
                'name' => $this->booker_name,
                'email' => $this->booker_email,
                'phone' => $this->booker_phone,
            ],

            'staying_guest' => [
                'name' => $this->staying_guest_name,
                'email' => $this->staying_guest_email,
                'phone' => $this->staying_guest_phone,
            ],

            'hotel' => $this->whenLoaded('hotel'),
            'rooms' => $this->whenLoaded('bookingRooms'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
