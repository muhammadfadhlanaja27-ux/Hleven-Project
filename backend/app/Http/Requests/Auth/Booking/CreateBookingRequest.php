<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

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