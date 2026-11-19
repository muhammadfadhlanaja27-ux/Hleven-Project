<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validasi pembuatan pemesanan kamar.
 *
 * Validasi input lengkap untuk creating booking beserta relasi hotel,
 * tanggal mengin/out, jumlah malam, harga, dan informasi tamu.
 *
 * Aturan validasi meliputi:
 * - hotel_id: wajib, hotel harus existence di database
 * - check_in: wajib, tanggal minimal hari ini, harus sebelum check_out
 * - check_out: wajib, harus setelah check_in
 * - total_night: wajib, bilangan bulat minimal 1
 * - subtotal/tax/grand_total: wajib, numerik minimal 0
 * - special_request: opsional, string
 * - is_for_other_guest: boolean, menentukan pemesanan untuk tamu lain
 * - guest_name/email/phone: wajib jika is_for_other_guest true, tanpa user_id
 * - rooms: array wajib minimal 1 record, setiap recordbutuh room_type_id dan quantity
 *
 * Logika tambahan:
 * - Jika user terlogin, user_id otomatis diisi dari auth sanctum
 * - Field guest_name/email/phone wajib jika pesan untuk tamu lain atau user belum login
 *
 * @param \Illuminate\Foundation\Http\FormRequest $request
 * @return void
     */
class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hotel_id' => 'required|exists:hotels,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'total_night' => 'required|integer|min:1',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
            'special_request' => 'nullable|string',

            'is_for_other_guest' => 'boolean',

            // Wajib diisi jika pesan untuk orang lain ATAU jika pengguna belum login
            'guest_name' => [
                'nullable',
                'string',
                'max:255',
                'required_if:is_for_other_guest,true',
                'required_without:user_id',
            ],
            'guest_email' => [
                'nullable',
                'email',
                'max:255',
                'required_if:is_for_other_guest,true',
                'required_without:user_id',
            ],
            'guest_phone' => [
                'nullable',
                'string',
                'max:20',
                'required_if:is_for_other_guest,true',
                'required_without:user_id',
            ],

            'rooms' => 'required|array|min:1',
            'rooms.*.room_type_id' => 'required|exists:room_types,id',
            'rooms.*.quantity' => 'required|integer|min:1',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (auth('sanctum')->check()) {
            $this->merge([
                'user_id' => auth('sanctum')->id(),
            ]);
        }
    }
}
