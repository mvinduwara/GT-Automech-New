<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Insurance extends Model
{
    use HasFactory;

    protected $fillable = [
        'insurance_no',
        'job_card_id',
        'customer_id',
        'vehicle_id',
        'user_id',
        'insurance_company',
        'policy_number',
        'claim_date',
        'claim_number',
        'accident_description',
        'accident_date',
        'accident_location',
        'damage_assessment',
        'remarks',
        'estimated_cost',
        'approved_amount',
        'excess_amount',
        'status',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'accident_date' => 'date',
        'estimated_cost' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'excess_amount' => 'decimal:2',
    ];

    /**
     * Boot method to generate insurance number
     */
    protected static function booted()
    {
        static::creating(function ($insurance) {
            if (empty($insurance->insurance_no)) {
                $insurance->insurance_no = static::generateInsuranceNo();
            }
        });
    }

    /**
     * Generate unique insurance number
     */
    public static function generateInsuranceNo(): string
    {
        $prefix = 'INS';
        $year = date('Y');
        $lastInsurance = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastInsurance ? intval(substr($lastInsurance->insurance_no, -6)) + 1 : 1;

        return sprintf('%s-%s-%06d', $prefix, $year, $number);
    }

    /**
     * Relationship with JobCard
     */
    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    /**
     * Relationship with Customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relationship with Vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Relationship with User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship with InsuranceItems
     */
    public function items(): HasMany
    {
        return $this->hasMany(InsuranceItem::class);
    }

    /**
     * Get total of all items
     */
    public function getTotalAttribute(): float
    {
        return $this->items->sum('total');
    }

    /**
     * Get total of approved items
     */
    public function getApprovedTotalAttribute(): float
    {
        return $this->items()->where('is_approved', true)->sum('approved_amount');
    }
}