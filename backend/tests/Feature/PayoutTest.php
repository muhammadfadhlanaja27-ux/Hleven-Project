<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\HotelPayoutDestination;
use App\Models\Payment;
use App\Models\User;
use App\Services\PayoutService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class PayoutTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        $this->createSchema();
    }

    private function createSchema(): void
    {
        Schema::create('users', function ($t) {
            $t->id();
            $t->string('role')->default('user');
            $t->string('name');
            $t->string('email')->unique();
            $t->string('password');
            $t->string('phone')->nullable();
            $t->string('status')->default('active');
            $t->timestamps();
        });
        Schema::create('personal_access_tokens', function ($t) {
            $t->id();
            $t->morphs('tokenable');
            $t->text('name');
            $t->string('token', 64)->unique();
            $t->text('abilities')->nullable();
            $t->timestamp('last_used_at')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
        });
        Schema::create('cities', function ($t) {
            $t->id();
            $t->string('province');
            $t->string('city');
        });
        Schema::create('hotels', function ($t) {
            $t->id();
            $t->foreignId('admin_id')->constrained('users');
            $t->foreignId('city_id')->constrained('cities');
            $t->string('name');
            $t->string('slug')->unique();
            $t->text('address')->nullable();
            $t->string('status')->default('active');
            $t->string('bank_name')->nullable();
            $t->string('bank_account_number')->nullable();
            $t->string('bank_account_name')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('bookings', function ($t) {
            $t->id();
            $t->string('booking_code')->unique();
            $t->foreignId('user_id')->constrained('users');
            $t->foreignId('hotel_id')->constrained('hotels');
            $t->date('check_in');
            $t->date('check_out');
            $t->integer('total_night');
            $t->decimal('subtotal', 15, 2);
            $t->decimal('tax', 15, 2);
            $t->decimal('grand_total', 15, 2);
            $t->string('status')->default('pending');
            $t->timestamps();
        });
        Schema::create('payments', function ($t) {
            $t->id();
            $t->foreignId('booking_id')->constrained('bookings');
            $t->string('payment_method')->nullable();
            $t->string('payment_status')->default('pending');
            $t->decimal('gross_amount', 15, 2);
            $t->string('order_id')->nullable();
            $t->timestamp('paid_at')->nullable();
            $t->timestamps();
        });
        Schema::create('hotel_payout_destinations', function ($t) {
            $t->id();
            $t->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $t->string('type', 20);
            $t->string('channel_code', 80);
            $t->text('account_number');
            $t->string('account_name');
            $t->string('provider_recipient_id')->nullable();
            $t->string('status', 20)->default('pending');
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('payouts', function ($t) {
            $t->id();
            $t->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $t->foreignId('requested_by')->constrained('users');
            $t->foreignId('approved_by')->nullable()->constrained('users');
            $t->decimal('amount', 15, 2);
            $t->string('status')->default('pending');
            $t->string('bank_name');
            $t->string('bank_account_number');
            $t->string('bank_account_name');
            $t->text('note')->nullable();
            $t->text('admin_note')->nullable();
            $t->string('reference')->nullable();
            $t->timestamp('requested_at');
            $t->timestamp('processed_at')->nullable();
            $t->timestamps();
        });
        Schema::create('notifications', function ($t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('title');
            $t->text('message');
            $t->string('type');
            $t->boolean('is_read')->default(false);
            $t->timestamp('created_at')->useCurrent();
        });
        Schema::create('activity_logs', function ($t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('activity');
            $t->text('description')->nullable();
            $t->string('ip_address')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });
    }

    protected function tearDown(): void
    {
        foreach ([
            'activity_logs', 'notifications', 'payouts', 'hotel_payout_destinations', 'payments', 'bookings',
            'hotels', 'cities', 'personal_access_tokens', 'users',
        ] as $t) {
            Schema::dropIfExists($t);
        }
        parent::tearDown();
    }

    public function test_balance_counts_only_final_bookings_at_95_percent(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');

        $this->makeBooking($hotel, 1000000, 'paid', 'success');
        $this->makeBooking($hotel, 500000, 'checked_out', 'success');
        $this->makeBooking($hotel, 700000, 'refunded', 'success');   // dikecualikan
        $this->makeBooking($hotel, 400000, 'pending', 'success');    // dikecualikan

        $balance = app(PayoutService::class)->getBalance($hotel);

        $this->assertEquals(1500000.0, $balance['gross_revenue']);
        $this->assertEquals(75000.0, $balance['platform_commission']);
        $this->assertEquals(1425000.0, $balance['net_revenue']);
        $this->assertEquals(1425000.0, $balance['available_balance']);
    }

    public function test_request_payout_reserves_available_balance(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        $service = app(PayoutService::class);
        $payout = $service->requestPayout($hotel, $hotel->admin, 500000, 'Tolong cairkan');

        $this->assertEquals('pending', $payout->status);
        $this->assertEquals(500000.0, (float) $payout->amount);
        $this->assertEquals(450000.0, $service->getBalance($hotel)['available_balance']);

        $this->expectException(RuntimeException::class);
        $service->requestPayout($hotel, $hotel->admin, 1000000);
    }

    public function test_request_payout_requires_bank_account(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $hotel->update(['bank_name' => null, 'bank_account_number' => null]);
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        $this->expectException(RuntimeException::class);
        app(PayoutService::class)->requestPayout($hotel, $hotel->admin, 100000);
    }

    public function test_request_payout_uses_selected_destination_snapshot(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        $destination = HotelPayoutDestination::create([
            'hotel_id' => $hotel->id,
            'type' => 'e_wallet',
            'channel_code' => 'GOPAY',
            'account_number' => '081234567890',
            'account_name' => 'Hotel Owner',
            'status' => 'active',
        ]);

        $this->actingAs($hotel->admin, 'sanctum')
            ->postJson('/api/v1/admin/payouts', [
                'amount' => 100000,
                'destination_id' => $destination->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.bank_name', 'GOPAY')
            ->assertJsonPath('data.bank_account_number', '081234567890')
            ->assertJsonPath('data.bank_account_name', 'Hotel Owner');
    }

    public function test_request_payout_rejects_another_hotels_destination(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $otherHotel = $this->makeHotel('Hotel B', 'b@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        $destination = HotelPayoutDestination::create([
            'hotel_id' => $otherHotel->id,
            'type' => 'bank',
            'channel_code' => 'BANK',
            'account_number' => '1234567890',
            'account_name' => 'Other Owner',
            'status' => 'active',
        ]);

        $this->actingAs($hotel->admin, 'sanctum')
            ->postJson('/api/v1/admin/payouts', [
                'amount' => 100000,
                'destination_id' => $destination->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('destination_id');
    }

    public function test_admin_hotel_payout_endpoints_and_super_admin_approval(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');
        $admin = $hotel->admin;

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/payouts')
            ->assertOk()
            ->assertJsonPath('data.balance.available_balance', 950000);

        $create = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/payouts', ['amount' => 400000, 'note' => 'Cairkan'])
            ->assertCreated();

        $payoutId = $create->json('data.id');

        $superAdmin = User::create([
            'name' => 'SA', 'email' => 'sa@x.com', 'password' => 'x',
            'role' => 'super_admin', 'status' => 'active',
        ]);

        $this->actingAs($superAdmin, 'sanctum')
            ->patchJson("/api/v1/super-admin/payouts/{$payoutId}/status", [
                'status' => 'paid', 'reference' => 'TRX-001',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $this->assertEquals(550000.0, app(PayoutService::class)->getBalance($hotel)['available_balance']);
    }

    public function test_super_admin_payout_requires_super_admin(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        $this->actingAs($hotel->admin, 'sanctum')
            ->getJson('/api/v1/super-admin/payouts')
            ->assertForbidden();
    }

    public function test_min_payout_enforced(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        config(['hleven.min_payout' => 50000]);

        $this->expectException(RuntimeException::class);
        app(PayoutService::class)->requestPayout($hotel, $hotel->admin, 10000);
    }

    public function test_commission_rate_from_config(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        config(['hleven.commission_rate' => 0.10]);

        $balance = app(PayoutService::class)->getBalance($hotel);

        $this->assertEquals(100000.0, $balance['platform_commission']);
        $this->assertEquals(900000.0, $balance['net_revenue']);
        $this->assertEquals(900000.0, $balance['available_balance']);
    }

    public function test_auto_approve_creates_approved_payout(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        config(['hleven.auto_approve_payout' => true, 'hleven.auto_approve_daily_limit' => 5000000]);

        $payout = app(PayoutService::class)->requestPayout($hotel, $hotel->admin, 100000);

        $this->assertEquals('approved', $payout->status);
    }

    public function test_auto_approve_exceeding_daily_limit_falls_back_to_pending(): void
    {
        $hotel = $this->makeHotel('Hotel A', 'a@x.com');
        $this->makeBooking($hotel, 1000000, 'paid', 'success');

        config(['hleven.auto_approve_payout' => true, 'hleven.auto_approve_daily_limit' => 120000]);

        $service = app(PayoutService::class);

        $first = $service->requestPayout($hotel, $hotel->admin, 80000);
        $this->assertEquals('approved', $first->status);

        $second = $service->requestPayout($hotel, $hotel->admin, 50000);
        $this->assertEquals('pending', $second->status);
    }

    private function makeHotel(string $name, string $email): Hotel
    {
        $city = City::first() ?? City::create(['province' => 'DKI', 'city' => 'Jakarta']);
        $admin = User::create([
            'name' => $name.' Admin', 'email' => $email, 'password' => 'x',
            'role' => 'admin_hotel', 'status' => 'active',
        ]);

        return Hotel::create([
            'admin_id' => $admin->id, 'city_id' => $city->id,
            'name' => $name, 'slug' => Str::slug($name).'-'.uniqid(),
            'address' => 'Jl Test', 'status' => 'active',
            'bank_name' => 'BCA', 'bank_account_number' => '1234567890', 'bank_account_name' => $name,
        ]);
    }

    private function makeBooking(Hotel $hotel, float $amount, string $bookingStatus, string $paymentStatus): Booking
    {
        $user = User::firstWhere('role', 'user') ?? User::create([
            'name' => 'Guest', 'email' => 'g@x.com', 'password' => 'x',
            'role' => 'user', 'status' => 'active',
        ]);

        $booking = Booking::create([
            'booking_code' => 'HLVN-'.uniqid(), 'user_id' => $user->id, 'hotel_id' => $hotel->id,
            'check_in' => now()->toDateString(), 'check_out' => now()->addDay()->toDateString(),
            'total_night' => 1, 'subtotal' => $amount, 'tax' => 0, 'grand_total' => $amount,
            'status' => $bookingStatus,
        ]);

        Payment::create([
            'booking_id' => $booking->id, 'payment_status' => $paymentStatus,
            'gross_amount' => $amount, 'paid_at' => now(),
        ]);

        return $booking;
    }
}
