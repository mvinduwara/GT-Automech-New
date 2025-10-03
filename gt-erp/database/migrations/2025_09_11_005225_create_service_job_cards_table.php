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
        Schema::create('service_job_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->references('id')->on('job_cards')->onDelete('restrict');
            $table->foreignId('oil')->nullable()->references('id')->on('stocks')->onDelete('restrict');
            $table->foreignId('oil_filter')->nullable()->references('id')->on('stocks')->onDelete('restrict');
            $table->foreignId('drain_plug_seal')->nullable()->references('id')->on('stocks')->onDelete('restrict');
            $table->foreignId('ac')->nullable()->references('id')->on('employees')->onDelete('restrict');
            $table->foreignId('electronic')->nullable()->references('id')->on('employees')->onDelete('restrict');
            $table->foreignId('mechanical')->nullable()->references('id')->on('employees')->onDelete('restrict');
            $table->enum('status', ['pending', 'complete', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_job_cards');
    }
};
