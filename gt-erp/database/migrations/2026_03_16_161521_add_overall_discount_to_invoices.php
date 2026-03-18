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
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('overall_discount', 12, 2)->default(0)->after('discount_total');
            $table->enum('overall_discount_type', ['fixed', 'percentage'])->default('fixed')->after('overall_discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['overall_discount', 'overall_discount_type']);
        });
    }
};
