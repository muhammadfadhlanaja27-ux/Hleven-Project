<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bed_types')) {
            Schema::create('bed_types', function (Blueprint $table) {
                $table->id();
                $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
                $table->string('name', 100);
                $table->string('size')->nullable();
                $table->integer('max_adults')->default(1);
                $table->integer('max_children')->default(0);
                $table->integer('max_total')->default(1);
                $table->text('description')->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();
                $table->softDeletes();
                $table->index(['hotel_id', 'status']);
            });
        }

        if (! Schema::hasColumn('room_types', 'bed_type_id')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->foreignId('bed_type_id')
                    ->nullable()
                    ->after('bed')
                    ->constrained('bed_types')
                    ->nullOnDelete();
            });
        }

        $roomBeds = DB::table('room_types')
            ->whereNotNull('bed')
            ->where('bed', '<>', '')
            ->get(['id', 'hotel_id', 'bed']);

        foreach ($roomBeds->groupBy('hotel_id') as $hotelId => $rooms) {
            $bedTypesByName = [];

            foreach ($rooms->pluck('bed')->unique() as $bedName) {
                $bedTypesByName[$bedName] = DB::table('bed_types')->insertGetId([
                    'hotel_id' => $hotelId,
                    'name' => $bedName,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach ($rooms as $room) {
                DB::table('room_types')
                    ->where('id', $room->id)
                    ->update(['bed_type_id' => $bedTypesByName[$room->bed]]);
            }
        }

        $standardBedTypes = [
            '1 Single Bed',
            '1 Twin Bed',
            '1 Queen Bed',
            '1 King Bed',
        ];

        $hotelIds = DB::table('hotels')->pluck('id');
        foreach ($hotelIds as $hotelId) {
            foreach ($standardBedTypes as $bedName) {
                $exists = DB::table('bed_types')
                    ->where('hotel_id', $hotelId)
                    ->where('name', $bedName)
                    ->exists();

                if (! $exists) {
                    DB::table('bed_types')->insert([
                        'hotel_id' => $hotelId,
                        'name' => $bedName,
                        'status' => 'active',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('room_types', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bed_type_id');
        });

        Schema::dropIfExists('bed_types');
    }
};
