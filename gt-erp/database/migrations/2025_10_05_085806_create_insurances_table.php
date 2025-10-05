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
        Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            $table->string('insurance_no')->unique();
            $table->foreignId('job_card_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Insurance specific fields
            $table->string('insurance_company')->nullable();
            $table->string('policy_number')->nullable();
            $table->date('claim_date')->nullable();
            $table->string('claim_number')->nullable();
            $table->text('accident_description')->nullable();
            $table->date('accident_date')->nullable();
            $table->string('accident_location')->nullable();

            // Damage assessment
            $table->text('damage_assessment')->nullable();
            $table->text('remarks')->nullable();

            // Financial
            $table->decimal('estimated_cost', 12, 2)->default(0);
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->decimal('excess_amount', 12, 2)->default(0);

            // Status
            $table->enum('status', ['pending', 'submitted', 'approved', 'rejected', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurances');
    }
};
