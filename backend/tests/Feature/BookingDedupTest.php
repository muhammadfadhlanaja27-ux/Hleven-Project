<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class BookingDedupTest extends TestCase
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
        Schema::create('room_types', function ($t) {
            $t->id();
            $t->foreignId('hotel_id')->constrained('hotels');
            $t->string('name');
            $t->integer('stock')->default(10);
            $t->integer('capacity_adult')->default(2);
            $t->integer('capacity_child')->default(0);
            $t->decimal('weekday_price', 15, 2)->default(100000);
            $t->decimal('weekend_price', 15, 2)->default(120000);
            $t->boolean('breakfast')->default(false);
            $t->boolean('smoking_area')->default(false);
            $t->boolean('is_refundable')->default(true);
            $t->boolean('is_active')->default(true);
            $t->string('type')->nullable();
            $t->string('bed')->nullable();
            $t->text('description')->nullable();
            $t->text('policies')->nullable();
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
            $t->smallInteger('children_count')->default(0);
            $t->decimal('subtotal', 15, 2);
            $t->decimal('tax', 15, 2);
            $t->decimal('grand_total', 15, 2);
            $t->text('special_request')->nullable();
            $t->string('status')->default('unpaid');
            $t->timestamps();
        });
        Schema::create('booking_rooms', function ($t) {
            $t->id();
            $t->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $t->foreignId('room_type_id')->constrained('room_types');
            $t->integer('qty')->default(1);
            $t->decimal('price_per_night', 12, 2)->default(0);
            $t->decimal('subtotal', 15, 2)->default(0);
            $t->timestamps();
        });
        Schema::create('guests', function ($t) {
            $t->id();
            $t->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $t->string('name');
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->string('identity_number')->nullable();
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
            $t->timestamp('expired_at')->nullable();
            $t->timestamps();
        });
        Schema::create('hotel_photos', function ($t) {
            $t->id();
            $t->foreignId('hotel_id')->constrained('hotels');
            $t->string('photo');
            $t->boolean('is_thumbnail')->default(false);
            $t->timestamps();
        });
        Schema::create('room_photos', function ($t) {
            $t->id();
            $t->foreignId('room_type_id')->constrained('room_types');
            $t->string('photo');
            $t->boolean('is_thumbnail')->default(false);
            $t->timestamps();
        });
        Schema::create('room_availabilities', function ($t) {
            $t->id();
            $t->foreignId('room_type_id')->constrained('room_types');
            $t->date('date');
            $t->integer('available_stock')->default(10);
            $t->integer('booked_room')->default(0);
            $t->timestamps();
        });
    }

    protected function tearDown(): void
    {
        foreach (['room_availabilities', 'room_photos', 'hotel_photos', 'payments', 'guests', 'booking_rooms', 'bookings', 'room_types', 'hotels', 'cities', 'personal_access_tokens', 'users'] as $t) {
            Schema::dropIfExists($t);
        }
        parent::tearDown();
    }

    public function test_double_post_same_details_returns_same_booking(): void
    {
        [$hotel, $room] = $this->makeHotelRoom();
        $user = User::create(['name' => 'Buyer', 'email' => 'buyer@x.com', 'password' => 'x', 'role' => 'user', 'status' => 'active']);
        $payload = $this->payload($hotel->id, $room->id);

        $first = $this->actingAs($user, 'sanctum')->postJson('/api/v1/bookings', $payload);
        $first->assertCreated();
        $firstCode = $first->json('data.booking.booking_code') ?? $first->json('data.data.booking.booking_code');

        $second = $this->actingAs($user, 'sanctum')->postJson('/api/v1/bookings', $payload);
        $second->assertOk();
        $second->assertJsonPath('deduped', true);
        $secondCode = $second->json('data.booking.booking_code') ?? $second->json('data.data.booking.booking_code');

        $this->assertEquals($firstCode, $secondCode);
        $this->assertEquals(1, Booking::count());
        $this->assertEquals(1, \App\Models\BookingRoom::count());
    }

    public function test_different_checkin_creates_new_booking(): void
    {
        [$hotel, $room] = $this->makeHotelRoom();
        $user = User::create(['name' => 'Buyer', 'email' => 'buyer2@x.com', 'password' => 'x', 'role' => 'user', 'status' => 'active']);

        $p1 = $this->payload($hotel->id, $room->id);
        $p2 = $this->payload($hotel->id, $room->id, now()->addDays(3)->toDateString(), now()->addDays(4)->toDateString());

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/bookings', $p1)->assertCreated();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/bookings', $p2)->assertCreated();
        $this->assertEquals(2, Booking::count());
    }

    private function makeHotelRoom(): array
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@x.com', 'password' => 'x', 'role' => 'admin_hotel', 'status' => 'active']);
        $city = City::create(['province' => 'Jabar', 'city' => 'Bandung']);
        $hotel = Hotel::create(['admin_id' => $admin->id, 'city_id' => $city->id, 'name' => 'Test Hotel', 'slug' => 'test-hotel-'.uniqid(), 'address' => 'Jl Test', 'status' => 'active']);
        $room = RoomType::create(['hotel_id' => $hotel->id, 'name' => 'Std', 'stock' => 10, 'capacity_adult' => 2, 'weekday_price' => 100000, 'weekend_price' => 120000, 'is_active' => true]);

        return [$hotel, $room];
    }

    private function payload(int $hotelId, int $roomTypeId, ?string $ci = null, ?string $co = null): array
    {
        return [
            'hotel_id' => $hotelId,
            'room_type_id' => $roomTypeId,
            'check_in' => $ci ?? now()->addDays(1)->toDateString(),
            'check_out' => $co ?? now()->addDays(2)->toDateString(),
            'qty' => 1,
            'adults' => 1,
            'guest_name' => 'Buyer',
            'guest_email' => 'buyer@x.com',
            'guest_phone' => '08123456789',
        ];
    }
}
