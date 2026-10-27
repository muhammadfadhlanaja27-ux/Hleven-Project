<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserBookingAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_booking_endpoint_requires_authentication(): void
    {
        $this->postJson('/api/v1/user/bookings', [])
            ->assertUnauthorized();
    }
}
