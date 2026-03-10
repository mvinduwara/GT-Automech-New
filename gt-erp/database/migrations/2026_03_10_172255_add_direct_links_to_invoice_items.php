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
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->foreignId('stock_id')->nullable()->constrained('stocks')->nullOnDelete();
            $table->foreignId('vehicle_service_option_id')->nullable()->constrained('vehicle_service_options')->nullOnDelete();
            
            $table->unsignedBigInteger('job_card_vehicle_service_id')->nullable()->change();
            $table->unsignedBigInteger('job_card_product_id')->nullable()->change();
            $table->unsignedBigInteger('job_card_charge_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropForeign(['stock_id']);
            $table->dropForeign(['vehicle_service_option_id']);
            $table->dropColumn(['stock_id', 'vehicle_service_option_id']);
            
            $table->unsignedBigInteger('job_card_vehicle_service_id')->nullable(false)->change();
            $table->unsignedBigInteger('job_card_product_id')->nullable(false)->change();
            $table->unsignedBigInteger('job_card_charge_id')->nullable(false)->change();
        });
    }
};
