<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            // Drop discount columns
            $table->dropColumn(['discount_type', 'discount_value']);
            
            // Add new columns
            $table->enum('item_type', ['service', 'product', 'charge'])->after('invoice_id');
            $table->foreignId('job_card_vehicle_service_id')->nullable()->after('item_type')->constrained('job_card_vehicle_services')->onDelete('set null');
            $table->foreignId('job_card_product_id')->nullable()->after('job_card_vehicle_service_id')->constrained('job_card_products')->onDelete('set null');
            $table->foreignId('job_card_charge_id')->nullable()->after('job_card_product_id')->constrained('job_card_charges')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            // Restore discount columns
            $table->enum('discount_type', ['percentage', 'amount'])->nullable();
            $table->decimal('discount_value', 12, 2)->default(0);
            
            // Drop new columns and foreign keys
            $table->dropForeign(['job_card_vehicle_service_id']);
            $table->dropForeign(['job_card_product_id']);
            $table->dropForeign(['job_card_charge_id']);
            $table->dropColumn(['item_type', 'job_card_vehicle_service_id', 'job_card_product_id', 'job_card_charge_id']);
        });
    }
};