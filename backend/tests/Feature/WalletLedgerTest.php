<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\HotelPayoutDestination;
use App\Models\Payment;
use App\Models\User;
use App\Models\WalletLedgerEntry;
use App\Services\WalletLedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletLedgerTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_payment_is_split_idempotently_and_tax_goes_to_hotel(): void
    {
        $booking = $this->createBooking('wallet-payment-001');
        $booking->payment()->update(['payment_status' => 'success']);
        $service = app(WalletLedgerService::class);

        $service->recordPayment($booking);
        $service->recordPayment($booking);

        $this->assertSame(400000, $service->balance('hotel', $booking->hotel_id, 'held'));
        $this->assertSame(20000, $service->balance('platform', null, 'held'));
        $this->assertDatabaseCount('wallet_ledger_entries', 2);
    }

    public function test_checkout_releases_held_balance_and_refund_reverses_it_once(): void
    {
        $booking = $this->createBooking('wallet-refund-001');
        $booking->payment()->update(['payment_status' => 'success']);
        $service = app(WalletLedgerService::class);
        $service->recordPayment($booking);

        $booking->update(['status' => 'checked_out']);
        $service->releaseBooking($booking);
        $service->releaseBooking($booking);

        $this->assertSame(400000, $service->balance('hotel', $booking->hotel_id, 'available'));
        $this->assertSame(20000, $service->balance('platform', null, 'available'));

        $service->reverseBooking($booking);
        $service->reverseBooking($booking);

        $this->assertSame(0, $service->balance('hotel', $booking->hotel_id, 'held'));
        $this->assertSame(0, $service->balance('hotel', $booking->hotel_id, 'available'));
        $this->assertSame(0, $service->balance('platform', null, 'available'));
        $this->assertSame(8, WalletLedgerEntry::count());
    }

    public function test_refund_after_withdrawal_creates_a_negative_hotel_balance(): void
    {
        $booking = $this->createBooking('wallet-debt-001');
        $booking->payment()->update(['payment_status' => 'success']);
        $service = app(WalletLedgerService::class);
        $service->recordPayment($booking);
        $service->releaseBooking($booking);

        WalletLedgerEntry::create([
            'account_type' => 'hotel',
            'hotel_id' => $booking->hotel_id,
            'entry_type' => 'withdrawal',
            'bucket' => 'available',
            'amount' => -400000,
            'currency' => 'IDR',
            'idempotency_key' => 'test:withdrawal:wallet-debt-001',
            'description' => 'Simulated completed withdrawal',
        ]);

        $service->reverseBooking($booking);

        $this->assertSame(-400000, $service->balance('hotel', $booking->hotel_id, 'available'));
    }

    public function test_payout_destination_account_number_is_encrypted_and_masked_in_api(): void
    {
        $admin = $this->createUser('wallet-admin@example.com', 'admin_hotel');
        $hotel = $this->createHotel($admin);
        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/v1/admin/wallet/destinations', [
            'type' => 'bank',
            'channel_code' => 'ID_BCA',
            'account_number' => '1234567890',
            'account_name' => 'Hotel Owner',
        ])
            ->assertCreated()
            ->assertJsonPath('data.masked_account_number', '******7890')
            ->assertJsonMissingPath('data.account_number');

        $destination = HotelPayoutDestination::firstOrFail();
        $storedValue = $destination->getRawOriginal('account_number');

        $this->assertNotSame('1234567890', $storedValue);
        $this->assertSame('1234567890', $destination->account_number);
        $this->assertSame($hotel->id, $destination->hotel_id);
    }

    public function test_hotel_admin_can_update_a_saved_payout_destination(): void
    {
        $admin = $this->createUser('wallet-update-admin@example.com', 'admin_hotel');
        $hotel = $this->createHotel($admin);
        $destination = HotelPayoutDestination::create([
            'hotel_id' => $hotel->id,
            'type' => 'e_wallet',
            'channel_code' => 'GOPAY',
            'account_number' => '0812345678',
            'account_name' => 'Old Name',
            'status' => 'active',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/wallet/destinations/{$destination->id}", [
                'type' => 'e_wallet',
                'channel_code' => 'GOPAY',
                'account_number' => '0898765432',
                'account_name' => 'New Name',
            ])
            ->assertOk()
            ->assertJsonPath('data.account_name', 'New Name')
            ->assertJsonPath('data.masked_account_number', '******5432')
            ->assertJsonMissingPath('data.account_number');

        $this->assertSame('0898765432', $destination->fresh()->account_number);
    }

    public function test_manual_payment_confirmation_adds_booking_to_hotel_wallet_once(): void
    {
        $booking = $this->createBooking('wallet-manual-paid-001');
        $customer = $booking->user;
        $payment = $booking->payment;
        $this->actingAs($customer, 'sanctum');

        $this->postJson("/api/v1/payments/{$payment->id}/mark-paid")
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'success');

        $this->postJson("/api/v1/payments/{$payment->id}/mark-paid")->assertOk();

        $service = app(WalletLedgerService::class);
        $this->assertSame(400000, $service->balance('hotel', $booking->hotel_id, 'held'));
        $this->assertDatabaseCount('wallet_ledger_entries', 2);
    }

    public function test_customer_auto_refund_uses_internal_status_update_and_reverses_wallet_entries(): void
    {
        $booking = $this->createBooking('wallet-auto-refund-001');
        $customer = $booking->user;
        $booking->payment()->update([
            'payment_status' => 'success',
            'paid_at' => now(),
        ]);
        $service = app(WalletLedgerService::class);
        $service->recordPayment($booking);
        $this->actingAs($customer, 'sanctum');

        $this->postJson("/api/v1/user/bookings/{$booking->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'refunded');

        $this->assertSame('refunded', $booking->fresh()->status);
        $this->assertSame(0, $service->balance('hotel', $booking->hotel_id, 'held'));
        $this->assertSame(0, $service->balance('platform', null, 'held'));
    }

    public function test_only_the_booking_hotel_admin_can_check_out_a_checked_in_booking(): void
    {
        $booking = $this->createBooking('wallet-checkout-001');
        $booking->payment()->update(['payment_status' => 'success']);
        $service = app(WalletLedgerService::class);
        $service->recordPayment($booking);

        $otherAdmin = $this->createUser('wallet-other-admin@example.com', 'admin_hotel');
        $this->createHotel($otherAdmin);
        $this->actingAs($otherAdmin, 'sanctum')
            ->patchJson("/api/v1/admin/bookings/{$booking->id}/status", ['status' => 'checked_out'])
            ->assertForbidden();

        $owner = $booking->hotel->admin;
        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/v1/admin/bookings/{$booking->id}/status", ['status' => 'checked_out'])
            ->assertUnprocessable();

        $booking->update(['status' => 'checked_in']);
        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/v1/admin/bookings/{$booking->id}/status", ['status' => 'checked_out'])
            ->assertOk();

        $this->assertSame(0, $service->balance('hotel', $booking->hotel_id, 'held'));
        $this->assertSame(400000, $service->balance('hotel', $booking->hotel_id, 'available'));
    }

    private function createBooking(string $bookingCode): Booking
    {
        $customer = $this->createUser("{$bookingCode}@example.com", 'user');
        $admin = $this->createUser("{$bookingCode}-admin@example.com", 'admin_hotel');
        $hotel = $this->createHotel($admin);
        $booking = Booking::create([
            'booking_code' => $bookingCode,
            'user_id' => $customer->id,
            'hotel_id' => $hotel->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'total_night' => 1,
            'subtotal' => 400000,
            'tax' => 20000,
            'grand_total' => 420000,
            'status' => 'paid',
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'pending',
            'gross_amount' => 420000,
            'order_id' => $bookingCode,
            'transaction_id' => "trx-{$bookingCode}",
        ]);

        return $booking;
    }

    private function createUser(string $email, string $role): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $email,
            'password' => bcrypt('password123'),
            'role' => $role,
            'status' => 'active',
        ]);
    }

    private function createHotel(User $admin): Hotel
    {
        $city = City::create(['province' => 'Jawa Barat', 'city' => 'Bandung']);

        return Hotel::create([
            'admin_id' => $admin->id,
            'city_id' => $city->id,
            'name' => 'Wallet Test Hotel',
            'slug' => 'wallet-test-'.$admin->id,
            'description' => 'Hotel test saldo',
            'address' => 'Jl. Test 123',
            'status' => 'active',
        ]);
    }
}
