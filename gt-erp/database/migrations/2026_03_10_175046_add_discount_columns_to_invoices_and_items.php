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
        if (!Schema::hasColumn('invoices', 'discount_total')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->decimal('discount_total', 12, 2)->default(0)->after('subtotal');
            });
        }

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->enum('discount_type', ['fixed', 'percentage'])->default('fixed')->after('unit_price');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('discount_type');
            $table->decimal('discount_total', 12, 2)->default(0)->after('discount_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('discount_total');
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'discount_amount', 'discount_total']);
        });
    }
};
