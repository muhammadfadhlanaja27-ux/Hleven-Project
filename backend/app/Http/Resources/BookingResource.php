<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'grand_total' => (float) $this->grand_total,
            'special_request' => $this->special_request,
            'is_for_other_guest' => (bool) $this->is_for_other_guest,

            'booker' => [
                'is_registered' => !is_null($this->user_id),
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