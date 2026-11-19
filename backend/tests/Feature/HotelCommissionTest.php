<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\User;
use App\Services\SuperAdminDashboardService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class HotelCommissionTest extends TestCase
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
            $t->text('address');
            $t->string('status')->default('active');
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
            $t->timestamp('paid_at')->nullable();
            $t->timestamps();
        });
    }

    protected function tearDown(): void
    {
        foreach (['payments', 'bookings', 'hotels', 'cities', 'personal_access_tokens', 'users'] as $t) {
            Schema::dropIfExists($t);
        }
        parent::tearDown();
    }

    public function test_commission_stats_group_per_hotel_with_5_percent(): void
    {
        [$hotelA, $hotelB] = $this->makeTwoHotels();
        $this->makePayment($hotelA, 1000000);
        $this->makePayment($hotelA, 500000);
        $this->makePayment($hotelB, 2000000);

        $result = app(SuperAdminDashboardService::class)->getHotelCommissionStats();

        $this->assertEquals(3500000.0, $result['summary']['total_hotel_revenue']);
        $this->assertEquals(175000.0, $result['summary']['total_platform_commission']);
        $this->assertEquals(2, $result['summary']['total_hotels']);

        $byName = collect($result['hotels'])->keyBy('name');
        $this->assertEquals(1500000.0, $byName['Hotel A']['hotel_revenue']);
        $this->assertEquals(75000.0, $byName['Hotel A']['platform_commission']);
        $this->assertEquals(1425000.0, $byName['Hotel A']['hotel_net']);
        $this->assertEquals(2, $byName['Hotel A']['transactions_count']);
        $this->assertEquals(100000.0, $byName['Hotel B']['platform_commission']);
    }

    public function test_commission_date_filter(): void
    {
        [$hotelA, $hotelB] = $this->makeTwoHotels();
        $this->makePayment($hotelA, 1000000, now()->subMonths(2));
        $this->makePayment($hotelB, 500000, now());

        $result = app(SuperAdminDashboardService::class)->getHotelCommissionStats(
            now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()
        );

        $this->assertEquals(1, $result['summary']['total_hotels']);
        $this->assertEquals(500000.0, $result['summary']['total_hotel_revenue']);
        $this->assertEquals('Hotel B', $result['hotels'][0]['name']);
    }

    public function test_commission_search_filters_hotels_and_chart(): void
    {
        [$hotelA, $hotelB] = $this->makeTwoHotels();
        $this->makePayment($hotelA, 1000000);
        $this->makePayment($hotelB, 2000000);

        $result = app(SuperAdminDashboardService::class)->getHotelCommissionStats(
            null, null, 'platform_commission', 'desc', 10, 'Hotel A'
        );

        $this->assertEquals(1, $result['summary']['total_hotels']);
        $this->assertEquals(1000000.0, $result['summary']['total_hotel_revenue']);
        $this->assertEquals(50000.0, $result['summary']['total_platform_commission']);
        $this->assertCount(1, $result['hotels']);
        $this->assertEquals('Hotel A', $result['hotels'][0]['name']);
        $this->assertCount(1, $result['chart_data']);
        $this->assertEquals('Hotel A', $result['chart_data'][0]['name']);
        $this->assertEquals(50000.0, $result['chart_data'][0]['platform_commission']);

        $all = app(SuperAdminDashboardService::class)->getHotelCommissionStats();
        $this->assertCount(2, $all['chart_data']);
        $this->assertEquals('Hotel B', $all['chart_data'][0]['name']);
    }

    public function test_commission_endpoint_requires_super_admin(): void
    {
        $user = User::create([
            'name' => 'User', 'email' => 'u@x.com', 'password' => 'x',
            'role' => 'user', 'status' => 'active',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/super-admin/dashboard/hotel-commission')
            ->assertForbidden();

        $sa = User::create([
            'name' => 'SA', 'email' => 'sa@x.com', 'password' => 'x',
            'role' => 'super_admin', 'status' => 'active',
        ]);
        [$hotelA] = $this->makeTwoHotels();
        $this->makePayment($hotelA, 1000000);

        $this->actingAs($sa, 'sanctum')
            ->getJson('/api/v1/super-admin/dashboard/hotel-commission')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary.total_platform_commission', 50000);
    }

    private function makeTwoHotels(): array
    {
        $city = City::create(['province' => 'DKI', 'city' => 'Jakarta']);
        $mk = function (string $name, string $email) use ($city) {
            $admin = User::create([
                'name' => $name.' Admin', 'email' => $email, 'password' => 'x',
                'role' => 'admin_hotel', 'status' => 'active',
            ]);

            return Hotel::create([
                'admin_id' => $admin->id, 'city_id' => $city->id,
                'name' => $name, 'slug' => Str::slug($name).'-'.uniqid(),
                'address' => 'Jl Test', 'status' => 'active',
            ]);
        };

        return [$mk('Hotel A', 'a@x.com'), $mk('Hotel B', 'b@x.com')];
    }

    private function makePayment(Hotel $hotel, float $amount, $paidAt = null): void
    {
        $user = User::firstWhere('role', 'user') ?? User::create([
            'name' => 'Guest', 'email' => 'g@x.com', 'password' => 'x',
            'role' => 'user', 'status' => 'active',
        ]);

        $booking = Booking::create([
            'booking_code' => 'HLVN-'.uniqid(), 'user_id' => $user->id, 'hotel_id' => $hotel->id,
            'check_in' => now()->toDateString(), 'check_out' => now()->addDay()->toDateString(),
            'total_night' => 1, 'subtotal' => $amount, 'tax' => 0, 'grand_total' => $amount,
            'status' => 'paid',
        ]);

        Payment::create([
            'booking_id' => $booking->id, 'payment_status' => 'success',
            'gross_amount' => $amount, 'paid_at' => $paidAt ?? now(),
        ]);
    }
}
