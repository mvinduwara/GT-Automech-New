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
        Schema::table('job_cards', function (Blueprint $table) {
            $table->foreignId('ac')->nullable()->references('id')->on('employees')->onDelete('restrict');
            $table->foreignId('electronic')->nullable()->references('id')->on('employees')->onDelete('restrict');
            $table->foreignId('mechanical')->nullable()->references('id')->on('employees')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_cards', function (Blueprint $table) {
            $table->dropColumn(['ac', 'electronic', 'mechanical']);
        });
    }
};
