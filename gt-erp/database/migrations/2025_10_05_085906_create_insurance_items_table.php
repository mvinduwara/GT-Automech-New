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
        Schema::create('insurance_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insurance_id')->constrained()->onDelete('cascade');
            $table->enum('item_type', ['service', 'product', 'charge']);

            // Foreign keys to original items (nullable as only one will be used)
            $table->foreignId('job_card_vehicle_service_id')->nullable()->constrained('job_card_vehicle_services')->onDelete('cascade');
            $table->foreignId('job_card_product_id')->nullable()->constrained('job_card_products')->onDelete('cascade');
            $table->foreignId('job_card_charge_id')->nullable()->constrained('job_card_charges')->onDelete('cascade');

            // Item details (copied from original for reference)
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->string('discount_type')->nullable(); // 'percentage' or 'amount'
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            // Insurance specific
            $table->boolean('is_approved')->default(false);
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurance_items');
    }
};
