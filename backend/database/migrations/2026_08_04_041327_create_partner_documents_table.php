<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_documents', function (Blueprint $table) {

            $table->id();

            $table->foreignId('partner_application_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('document_type');

            $table->string('file');

            $table->boolean('verified')->default(false);

            $table->timestamp('uploaded_at')->nullable();

            $table->timestamps();

            $table->index('partner_application_id');
            $table->index('verified');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_documents');
    }
};