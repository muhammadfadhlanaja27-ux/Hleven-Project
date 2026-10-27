<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('room_type_categories')) {
            Schema::create('room_type_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
                $table->string('name', 100);
                $table->text('description')->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();
                $table->softDeletes();
                $table->index(['hotel_id', 'status']);
            });
        }

        if (! Schema::hasColumn('room_types', 'room_type_category_id')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->foreignId('room_type_category_id')
                    ->nullable()
                    ->after('type')
                    ->constrained('room_type_categories')
                    ->nullOnDelete();
            });
        }

        // Hanya ambil room_types yang hotel_id-nya benar-benar ada di tabel hotels (mencegah FK orphan error)
        $validHotelIds = DB::table('hotels')->pluck('id');

        $rooms = DB::table('room_types')
            ->whereIn('hotel_id', $validHotelIds)
            ->select('id', 'hotel_id', 'type')
            ->get();

        foreach ($rooms->groupBy('hotel_id') as $hotelId => $hotelRooms) {
            $categoryIds = [];

            foreach ($hotelRooms as $room) {
                $categoryName = trim((string) ($room->type ?: 'Standard'));

                if (! isset($categoryIds[$categoryName])) {
                    $categoryId = DB::table('room_type_categories')
                        ->where('hotel_id', $hotelId)
                        ->where('name', $categoryName)
                        ->whereNull('deleted_at')
                        ->value('id');

                    if (! $categoryId) {
                        $categoryId = DB::table('room_type_categories')->insertGetId([
                            'hotel_id' => $hotelId,
                            'name' => $categoryName,
                            'status' => 'active',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    $categoryIds[$categoryName] = $categoryId;
                }

                DB::table('room_types')
                    ->where('id', $room->id)
                    ->update(['room_type_category_id' => $categoryIds[$categoryName]]);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'room_type_category_id')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropConstrainedForeignId('room_type_category_id');
            });
        }

        Schema::dropIfExists('room_type_categories');
    }
};