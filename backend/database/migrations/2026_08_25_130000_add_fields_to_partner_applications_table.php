<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partner_applications', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->after('id');
            $table->string('application_number', 50)->unique()->nullable()->after('user_id');

            $table->string('hotel_type')->nullable()->after('hotel_name');
            $table->text('hotel_description')->nullable()->after('hotel_type');
            $table->string('hotel_phone')->nullable()->after('hotel_description');
            $table->string('hotel_email')->nullable()->after('hotel_phone');
            $table->unsignedInteger('room_count')->nullable()->after('hotel_email');

            $table->text('address')->nullable()->after('phone');
            $table->string('province')->nullable()->after('address');
            $table->string('city')->nullable()->after('province');
            $table->string('district')->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('district');
            $table->text('maps_url')->nullable()->after('postal_code');
            $table->string('latitude', 50)->nullable()->after('maps_url');
            $table->string('longitude', 50)->nullable()->after('latitude');

            $table->string('owner_id_number', 50)->nullable()->after('phone');

            $table->string('bank_name')->nullable()->after('owner_id_number');
            $table->string('bank_account_number')->nullable()->after('bank_name');
            $table->string('bank_account_name')->nullable()->after('bank_account_number');

            $table->text('rejection_reason')->nullable()->after('status');
            $table->text('revision_notes')->nullable()->after('rejection_reason');
        });

        Schema::table('partner_applications', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('partner_applications', function (Blueprint $table) {
            $table->enum('status', ['pending', 'under_review', 'needs_revision', 'approved', 'rejected'])->default('pending')->after('bank_account_name');
        });
    }

    public function down(): void
    {
        Schema::table('partner_applications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropUnique(['application_number']);
            $table->dropColumn([
                'application_number',
                'hotel_type', 'hotel_description', 'hotel_phone', 'hotel_email', 'room_count',
                'address', 'province', 'city', 'district', 'postal_code', 'maps_url', 'latitude', 'longitude',
                'owner_id_number',
                'bank_name', 'bank_account_number', 'bank_account_name',
                'rejection_reason', 'revision_notes',
                'status'
            ]);
        });

        Schema::table('partner_applications', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('phone');
        });
    }
};
