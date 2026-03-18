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
        Schema::table('petty_cash_vouchers', function (Blueprint $table) {
            $table->string('status')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('petty_cash_vouchers', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending')->change();
        });
    }
};
