<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'job_card_id',
        'customer_id',
        'subtotal',
        'discount_total',
        'advance_payment',
        'total',
        'status',
        'invoice_date',
        'due_date',
        'remarks',
    ];

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function jobCard()
    {
        return $this->belongsTo(JobCard::class);
    }

    public function getRemainingAttribute(): float
    {
        return max(0, $this->total - $this->advance_payment);
    }
}
