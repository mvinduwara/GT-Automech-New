<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_card_vehicle_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->references('id')->on('job_cards')->onDelete('restrict');
            $table->foreignId('vehicle_service_id')->references('id')->on('vehicle_services')->onDelete('restrict');
            $table->foreignId('vehicle_service_option_id')->references('id')->on('vehicle_service_options')->onDelete('restrict');
            $table->boolean('is_included')->default(true);
            $table->integer('subtotal')->default(0);
            $table->enum('discount_type', ['percentage', 'amount'])->nullable();
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->integer('total')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_card_vehicle_services');
    }
};
