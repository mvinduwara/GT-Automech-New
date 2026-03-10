<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'date',
        'amount',
        'description',
        'payment_method',
        'reference_number',
        'proof_path',
        'user_id',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the account (category) for the expense.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the user who recorded the expense.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all of the expense's ledger entries.
     */
    public function ledgerEntries(): MorphMany
    {
        return $this->morphMany(LedgerEntry::class, 'transactionable');
    }

    /**
     * Sync ledger entries for this expense.
     */
    public function syncLedgerEntry()
    {
        $this->ledgerEntries()->updateOrCreate(
            ['account_id' => $this->account_id],
            [
                'date' => $this->date,
                'description' => $this->description ?: "Expense: " . $this->account->name,
                'debit' => $this->amount,
                'credit' => 0.00,
            ]
        );
    }
}
