<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewEligibilityAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_eligible_bookings_requires_authentication(): void
    {
        $this->getJson('/api/v1/hotels/1793/eligible-bookings')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_authenticated_user_can_load_eligible_bookings(): void
    {
        $user = User::create([
            'name' => 'Review User',
            'email' => 'review-user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/hotels/1793/eligible-bookings')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data', []);
    }

    public function test_authenticated_user_review_submission_route_is_available(): void
    {
        $user = User::create([
            'name' => 'Review User',
            'email' => 'review-submit@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/hotels/1793/reviews', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['booking_id', 'rating']);
    }
}
