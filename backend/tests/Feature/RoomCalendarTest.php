<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomAvailability;
use App\Models\RoomType;
use App\Models\User;
use App\Services\RoomAvailabilityService;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RoomCalendarTest extends TestCase
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
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('bed_types', function ($t) {
            $t->id();
            $t->foreignId('hotel_id')->nullable();
            $t->string('name')->nullable();
            $t->timestamps();
        });
        Schema::create('facilities', function ($t) {
            $t->id();
            $t->string('name')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('room_types', function ($t) {
            $t->id();
            $t->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $t->foreignId('bed_type_id')->nullable();
            $t->string('name');
            $t->string('type')->nullable();
            $t->text('description')->nullable();
            $t->decimal('weekday_price', 15, 2);
            $t->decimal('weekend_price', 15, 2);
            $t->integer('stock');
            $t->integer('capacity_adult')->default(2);
            $t->integer('capacity_child')->default(0);
            $t->boolean('breakfast')->default(false);
            $t->boolean('smoking_area')->default(false);
            $t->boolean('is_refundable')->default(true);
            $t->boolean('is_active')->default(true);
            $t->integer('bed_count')->default(1);
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('room_facilities', function ($t) {
            $t->foreignId('room_type_id');
            $t->foreignId('facility_id');
        });
        Schema::create('room_photos', function ($t) {
            $t->id();
            $t->foreignId('room_type_id');
            $t->string('photo');
            $t->boolean('is_thumbnail')->default(false);
            $t->timestamps();
        });
        Schema::create('room_availabilities', function ($t) {
            $t->id();
            $t->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete();
            $t->date('date');
            $t->integer('available_stock');
            $t->integer('booked_room')->default(0);
            $t->decimal('price', 15, 2)->nullable();
            $t->boolean('is_closed')->default(false);
            $t->timestamps();
            $t->unique(['room_type_id', 'date']);
        });
        Schema::create('bookings', function ($t) {
            $t->id();
            $t->string('booking_code')->unique();
            $t->string('idempotency_key')->nullable()->unique();
            $t->foreignId('user_id')->constrained('users');
            $t->foreignId('hotel_id')->constrained('hotels');
            $t->date('check_in');
            $t->date('check_out');
            $t->integer('total_night');
            $t->integer('children_count')->default(0);
            $t->decimal('subtotal', 15, 2);
            $t->decimal('tax', 15, 2);
            $t->decimal('tax_rate', 5, 2)->nullable();
            $t->decimal('grand_total', 15, 2);
            $t->text('special_request')->nullable();
            $t->string('status')->default('pending');
            $t->timestamps();
        });
        Schema::create('booking_rooms', function ($t) {
            $t->id();
            $t->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $t->foreignId('room_type_id')->constrained('room_types');
            $t->integer('qty');
            $t->decimal('price_per_night', 15, 2);
            $t->decimal('subtotal', 15, 2);
            $t->timestamps();
        });
        Schema::create('guests', function ($t) {
            $t->id();
            $t->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $t->string('name');
            $t->string('phone')->nullable();
            $t->string('email')->nullable();
            $t->string('gender')->nullable();
            $t->string('identity_number')->nullable();
            $t->timestamps();
        });
        Schema::create('payments', function ($t) {
            $t->id();
            $t->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $t->string('payment_method')->nullable();
            $t->string('payment_status')->default('pending');
            $t->decimal('gross_amount', 15, 2);
            $t->string('transaction_id')->nullable();
            $t->string('order_id')->nullable();
            $t->string('snap_token')->nullable();
            $t->timestamp('paid_at')->nullable();
            $t->timestamp('expired_at')->nullable();
            $t->timestamps();
        });
        Schema::create('notifications', function ($t) {
            $t->id();
            $t->foreignId('user_id');
            $t->string('title');
            $t->text('message');
            $t->string('type');
            $t->boolean('is_read')->default(false);
            $t->timestamp('created_at')->useCurrent();
        });
    }

    protected function tearDown(): void
    {
        foreach ([
            'notifications', 'payments', 'guests', 'booking_rooms', 'bookings',
            'room_availabilities', 'room_photos', 'room_facilities', 'room_types',
            'facilities', 'bed_types', 'hotels', 'cities', 'personal_access_tokens', 'users',
        ] as $t) {
            Schema::dropIfExists($t);
        }
        parent::tearDown();
    }

    public function test_quote_uses_weekday_weekend_and_override(): void
    {
        $room = $this->makeRoom();

        // Mon + Tue (weekday 100k) dengan override 150k pada Selasa.
        RoomAvailability::create([
            'room_type_id' => $room->id, 'date' => '2026-01-06',
            'available_stock' => 5, 'booked_room' => 0, 'price' => 150000,
        ]);

        $period = CarbonPeriod::create('2026-01-05', '2026-01-06');
        $quote = app(RoomAvailabilityService::class)->quote($room, $period, 1);

        $this->assertEquals(250000.0, $quote['subtotal']);
        $this->assertEmpty($quote['closed_dates']);
    }

    public function test_quote_falls_back_to_weekend_price(): void
    {
        $room = $this->makeRoom();
        $period = CarbonPeriod::create('2026-01-03', '2026-01-04'); // Sabtu + Minggu
        $quote = app(RoomAvailabilityService::class)->quote($room, $period, 2);

        $this->assertEquals(800000.0, $quote['subtotal']); // 2 x 200k x 2 malam
    }

    public function test_quote_detects_closed_dates(): void
    {
        $room = $this->makeRoom();
        RoomAvailability::create([
            'room_type_id' => $room->id, 'date' => '2026-01-06',
            'available_stock' => 5, 'booked_room' => 0, 'is_closed' => true,
        ]);

        $period = CarbonPeriod::create('2026-01-05', '2026-01-06');
        $quote = app(RoomAvailabilityService::class)->quote($room, $period, 1);

        $this->assertEquals(['2026-01-06'], $quote['closed_dates']);
        $this->assertEquals(100000.0, $quote['subtotal']);
    }

    public function test_calendar_show_and_update_endpoints(): void
    {
        [$room, $admin] = $this->makeRoomWithAdmin();

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/admin/rooms/{$room->id}/calendar?month=2026-01")
            ->assertOk()
            ->assertJsonPath('data.room_type.id', $room->id)
            ->assertJsonCount(31, 'data.days');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/rooms/{$room->id}/calendar", [
                'days' => [
                    ['date' => '2026-01-10', 'price' => 175000, 'is_closed' => false],
                    ['date' => '2026-01-11', 'is_closed' => true],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('room_availabilities', [
            'room_type_id' => $room->id, 'date' => '2026-01-10', 'price' => 175000,
        ]);
        $this->assertDatabaseHas('room_availabilities', [
            'room_type_id' => $room->id, 'date' => '2026-01-11', 'is_closed' => true,
        ]);
    }

    public function test_calendar_scoped_to_own_hotel(): void
    {
        [$room] = $this->makeRoomWithAdmin();
        $other = User::create([
            'name' => 'Other', 'email' => 'other@x.com', 'password' => 'x',
            'role' => 'admin_hotel', 'status' => 'active',
        ]);

        $this->actingAs($other, 'sanctum')
            ->getJson("/api/v1/admin/rooms/{$room->id}/calendar")
            ->assertNotFound();
    }

    public function test_public_rooms_marks_closed_range_as_unavailable(): void
    {
        [$room, , $hotel] = $this->makeRoomWithAdmin();
        RoomAvailability::create([
            'room_type_id' => $room->id, 'date' => '2026-02-10',
            'available_stock' => 5, 'booked_room' => 0, 'is_closed' => true,
        ]);

        $this->getJson("/api/v1/hotels/{$hotel->id}/rooms?check_in=2026-02-10&check_out=2026-02-12")
            ->assertOk()
            ->assertJsonPath('data.0.available_stock', 0);
    }

    public function test_manual_booking_rejected_when_date_closed(): void
    {
        [$room, $admin] = $this->makeRoomWithAdmin();
        RoomAvailability::create([
            'room_type_id' => $room->id, 'date' => '2026-03-10',
            'available_stock' => 5, 'booked_room' => 0, 'is_closed' => true,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/bookings/manual', [
                'room_type_id' => $room->id,
                'check_in' => '2026-03-10',
                'check_out' => '2026-03-11',
                'qty' => 1,
                'adults' => 1,
                'children' => 0,
                'guest_name' => 'Tamu',
                'guest_phone' => '08123',
                'payment_method' => 'cash',
            ])
            ->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }

    private function makeRoom(): RoomType
    {
        return $this->makeRoomWithAdmin()[0];
    }

    private function makeRoomWithAdmin(): array
    {
        $city = City::create(['province' => 'DKI', 'city' => 'Jakarta']);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin'.uniqid().'@x.com', 'password' => 'x',
            'role' => 'admin_hotel', 'status' => 'active',
        ]);
        $hotel = Hotel::create([
            'admin_id' => $admin->id, 'city_id' => $city->id,
            'name' => 'Hotel', 'slug' => 'hotel-'.uniqid(), 'status' => 'active',
        ]);
        $room = RoomType::create([
            'hotel_id' => $hotel->id, 'name' => 'Deluxe',
            'weekday_price' => 100000, 'weekend_price' => 200000,
            'stock' => 5, 'capacity_adult' => 2, 'capacity_child' => 0,
        ]);

        return [$room, $admin, $hotel, $room];
    }
}
