<?php

namespace Tests\Feature;

use Tests\TestCase;

class ReviewEligibilityAuthTest extends TestCase
{
    public function test_eligible_bookings_requires_authentication(): void
    {
        $this->getJson('/api/v1/hotels/1793/eligible-bookings')
            ->assertUnauthorized()
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Silakan login untuk melihat pesanan yang dapat diulas.');
    }
}
