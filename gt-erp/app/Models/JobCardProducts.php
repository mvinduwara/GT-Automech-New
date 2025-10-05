<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobCardProducts extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_card_id',
        'stock_id',
        'user_id',
        'quantity',
        'unit_price',
        'subtotal',
        'discount_type',
        'discount_value',
        'total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Boot method to calculate total before saving
     */
    protected static function booted()
    {
        static::saving(function ($jobCardProduct) {
            $jobCardProduct->subtotal = $jobCardProduct->quantity * $jobCardProduct->unit_price;
            $jobCardProduct->total = $jobCardProduct->calculateTotal();
        });
    }

    /**
     * Calculate the total amount after discount
     */
    public function calculateTotal(): float
    {
        $subtotal = $this->quantity * $this->unit_price;
        $discountValue = $this->discount_value ?? 0;

        if ($this->discount_type === 'percentage') {
            $discountAmount = ($subtotal * $discountValue) / 100;
            return round($subtotal - $discountAmount, 2);
        } elseif ($this->discount_type === 'amount') {
            return round(max(0, $subtotal - $discountValue), 2);
        }

        return round($subtotal, 2);
    }

    /**
     * Relationship with JobCard
     */
    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    /**
     * Relationship with Stock
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    /**
     * Relationship with User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}