<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Tests\TestCase;

class UserBookingAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_booking_endpoint_requires_authentication(): void
    {
        $this->postJson('/api/v1/user/bookings', [])
            ->assertUnauthorized();
    }

    public function test_user_partner_application_status_returns_empty_when_user_has_no_application(): void
    {
        $user = User::create([
            'name' => 'Partner User',
            'email' => 'partner-user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/user/partner-application')
            ->assertOk()
            ->assertJsonPath('data', null);
    }
}
