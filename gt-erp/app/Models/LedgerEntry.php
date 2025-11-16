<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are not mass assignable.
     *
     * @var array<string>
     */
    protected $guarded = [];

    /**
     * Get the parent transactionable model (Invoice, PettyCashVoucher, etc.).
     */
    public function transactionable()
    {
        return $this->morphTo();
    }

    /**
     * Get the account associated with the ledger entry.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}

