<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobCardCharges extends Model
{
    protected $fillable = [
        'job_card_id',
        'user_id',
        'name',
        'charge',
        'discount_type',
        'discount_value',
        'total',
    ];

    protected $casts = [
        'charge' => 'integer',
        'discount_value' => 'decimal:2',
        'total' => 'integer',
    ];

    /**
     * Boot method to calculate total before saving
     */
    protected static function booted()
    {
        static::saving(function ($jobCardCharge) {
            $jobCardCharge->total = $jobCardCharge->calculateTotal();
        });
    }

    /**
     * Calculate the total amount after discount
     */
    public function calculateTotal(): int
    {
        $charge = $this->charge;
        $discountValue = $this->discount_value ?? 0;

        if ($this->discount_type === 'percentage') {
            $discountAmount = ($charge * $discountValue) / 100;
            return (int) ($charge - $discountAmount);
        } elseif ($this->discount_type === 'amount') {
            return (int) max(0, $charge - $discountValue);
        }

        return $charge;
    }

    /**
     * Relationship with JobCard
     */
    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    /**
     * Relationship with User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}