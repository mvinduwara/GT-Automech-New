<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->nullable();
            $table->string('reference_no')->nullable();
            $table->timestamps();
        });

        // Migrate existing advance_payment records into invoice_payments
        DB::statement("
            INSERT INTO invoice_payments (invoice_id, amount, payment_method, created_at, updated_at)
            SELECT id, advance_payment, payment_method, created_at, updated_at
            FROM invoices
            WHERE advance_payment > 0
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_payments');
    }
};
