<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'item_type',
        'job_card_vehicle_service_id',
        'job_card_product_id',
        'job_card_charge_id',
        'stock_id',
        'vehicle_service_option_id',
        'description',
        'quantity',
        'unit_price',
        'discount_type',
        'discount_amount',
        'discount_total',
        'line_total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function jobCardVehicleService(): BelongsTo
    {
        return $this->belongsTo(JobCardVehicleService::class);
    }

    public function jobCardProduct(): BelongsTo
    {
        return $this->belongsTo(JobCardProducts::class);
    }

    public function jobCardCharge(): BelongsTo
    {
        return $this->belongsTo(JobCardCharges::class);
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    public function vehicleServiceOption(): BelongsTo
    {
        return $this->belongsTo(VehicleServiceOption::class);
    }
}