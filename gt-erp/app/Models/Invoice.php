<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'job_card_id',
        'customer_id',
        'user_id',
        'services_total',
        'products_total',
        'charges_total',
        'subtotal',
        'discount_total',
        'advance_payment',
        'total',
        'status',
        'payment_method',
        'invoice_date',
        'due_date',
        'remarks',
        'terms_conditions',
        'manual_rating',
        'manual_feedback',
        'overall_discount',
        'overall_discount_type',
        'rounding_adjustment',
    ];

    protected $casts = [
        'services_total' => 'decimal:2',
        'products_total' => 'decimal:2',
        'charges_total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'advance_payment' => 'decimal:2',
        'total' => 'decimal:2',
        'overall_discount' => 'decimal:2',
        'rounding_adjustment' => 'decimal:2',
        'invoice_date' => 'date',
        'due_date' => 'date',
    ];

    // ADD THIS LINE - Automatically append accessor to JSON/Array output
    protected $appends = ['remaining'];

    /**
     * Boot method to calculate totals before saving
     */
    protected static function booted()
    {

        static::creating(function ($invoice) { // <-- Add this creating event
            $invoice->review_token = (string) Str::uuid();
        });

        static::saving(function ($invoice) {
            // Calculate subtotal from all line items
            $invoice->subtotal = $invoice->services_total + $invoice->products_total + $invoice->charges_total;

            // Apply overall discount
            $overallDiscountAmount = 0;
            if ($invoice->overall_discount_type === 'percentage') {
                $overallDiscountAmount = ($invoice->subtotal * ($invoice->overall_discount ?? 0)) / 100;
            } else {
                $overallDiscountAmount = $invoice->overall_discount ?? 0;
            }

            // Total is subtotal minus overall discount plus rounding adjustment
            $invoice->total = max(0, ($invoice->subtotal - $overallDiscountAmount) + ($invoice->rounding_adjustment ?? 0));

            // Update status based on payment
            $invoice->updatePaymentStatus();
        });
    }

    /**
     * Update payment status based on advance payment
     */
    public function updatePaymentStatus(): void
    {
        if ($this->status === 'cancelled') {
            return;
        }

        if ($this->advance_payment >= $this->total) {
            $this->status = 'paid';
        } elseif ($this->advance_payment > 0) {
            $this->status = 'partial';
        } else {
            $this->status = 'unpaid';
        }
    }

    /**
     * Get remaining balance
     */
    public function getRemainingAttribute(): float
    {
        return max(0, $this->total - $this->advance_payment);
    }

    /**
     * Relationships
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class)->withDefault();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function review(): HasOne // <-- Add this function
    {
        return $this->hasOne(CustomerReview::class);
    }
}
