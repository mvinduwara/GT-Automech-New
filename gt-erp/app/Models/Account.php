<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'name',
        'code',
        'type',
        'description',
        'opening_balance',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
    ];

    public function ledgerEntry()
    {
        return $this->hasMany(LedgerEntry::class);
    }
}
