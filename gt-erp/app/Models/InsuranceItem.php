<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsuranceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'insurance_id',
        'item_type',
        'job_card_vehicle_service_id',
        'job_card_product_id',
        'job_card_charge_id',
        'item_name',
        'description',
        'quantity',
        'unit_price',
        'subtotal',
        'discount_type',
        'discount_value',
        'total',
        'is_approved',
        'approved_amount',
        'rejection_reason',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'total' => 'decimal:2',
        'is_approved' => 'boolean',
        'approved_amount' => 'decimal:2',
    ];

    /**
     * Relationship with Insurance
     */
    public function insurance(): BelongsTo
    {
        return $this->belongsTo(Insurance::class);
    }

    /**
     * Relationship with JobCardVehicleService
     */
    public function jobCardVehicleService(): BelongsTo
    {
        return $this->belongsTo(JobCardVehicleService::class);
    }

    /**
     * Relationship with JobCardProduct
     */
    public function jobCardProduct(): BelongsTo
    {
        return $this->belongsTo(JobCardProducts::class);
    }

    /**
     * Relationship with JobCardCharge
     */
    public function jobCardCharge(): BelongsTo
    {
        return $this->belongsTo(JobCardCharges::class);
    }
}