<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bed_types', function (Blueprint $table) {
            if (! Schema::hasColumn('bed_types', 'size')) {
                $table->string('size')->nullable();
            }

            if (! Schema::hasColumn('bed_types', 'max_adults')) {
                $table->integer('max_adults')->default(1);
            }

            if (! Schema::hasColumn('bed_types', 'max_children')) {
                $table->integer('max_children')->default(0);
            }

            if (! Schema::hasColumn('bed_types', 'max_total')) {
                $table->integer('max_total')->default(1);
            }
        });
    }

    public function down(): void
    {
        $columns = array_filter(
            ['size', 'max_adults', 'max_children', 'max_total'],
            fn (string $column) => Schema::hasColumn('bed_types', $column)
        );

        if ($columns !== []) {
            Schema::table('bed_types', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
