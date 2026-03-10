<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PettyCashVoucher extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'voucher_number',
        'date',
        'name',
        'requested_by_user_id',
        'approved_by_user_id',
        'description',
        'requested_amount',
        'total_amount',
        'actual_amount',
        'balance_amount',
        'proof_path',
        'status',
        'finalized_at',
        'checked',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'requested_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'finalized_at' => 'datetime',
        'checked' => 'boolean',
    ];

    /**
     * Get the user who requested this voucher.
     */
    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    /**
     * Get the user who approved this voucher.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    /**
     * Get the petty cash items for this voucher.
     */
    public function items(): HasMany
    {
        return $this->hasMany(PettyCashItem::class, 'petty_cash_voucher_id');
    }

    /**
     * Get the ledger entries associated with this voucher.
     */
    public function ledgerEntries()
    {
        return $this->morphMany(LedgerEntry::class, 'transactionable');
    }
}