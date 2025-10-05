<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['discount_total']);
            
            // Add new columns
            $table->foreignId('user_id')->after('customer_id')->constrained()->onDelete('restrict');
            $table->decimal('services_total', 12, 2)->default(0)->after('user_id');
            $table->decimal('products_total', 12, 2)->default(0)->after('services_total');
            $table->decimal('charges_total', 12, 2)->default(0)->after('products_total');
            $table->text('terms_conditions')->nullable()->after('remarks');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Restore old columns
            $table->decimal('discount_total', 12, 2)->default(0);
            
            // Drop new columns
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'services_total', 'products_total', 'charges_total', 'terms_conditions']);
        });
    }
};