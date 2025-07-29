<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCashItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'petty_cash_voucher_id',
        'item_description',
        'quantity',
        'unit_price',
        'amount',
        'checked',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
        'checked' => 'boolean',
    ];

    /**
     * Get the petty cash voucher that owns the item.
     */
    public function voucher(): BelongsTo
    {
        return $this->belongsTo(PettyCashVoucher::class, 'petty_cash_voucher_id');
    }
}
