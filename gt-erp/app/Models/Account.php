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
    ];


    public function ledgerEntry()
    {
        return $this->hasMany(LedgerEntry::class);
    }
}
