<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('petty_cash_vouchers', function (Blueprint $table) {
            $table->decimal('requested_amount', 10, 2)->after('name')->default(0);
            $table->decimal('actual_amount', 10, 2)->nullable()->after('total_amount');
            $table->decimal('balance_amount', 10, 2)->nullable()->after('actual_amount');
            $table->string('proof_path')->nullable()->after('description');
            $table->timestamp('finalized_at')->nullable()->after('status');

            // Laravel doesn't support modifying enums easily in migrations without additional packages or raw SQL
            // But we can add a comment or just handle 'finalized' as a valid status in the code
            // For now, let's keep the existing enum and add the new columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('petty_cash_vouchers', function (Blueprint $table) {
            $table->dropColumn(['requested_amount', 'actual_amount', 'balance_amount', 'proof_path', 'finalized_at']);
        });
    }
};
