<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrnLedger extends Model
{
    use HasFactory;

    protected $fillable = [
        'grn_id',
        'date',
        'debit',
        'credit',
        'amount',
        'remarks',
        'final_date',
    ];

    public function grn()
    {
        return $this->belongsTo(Grn::class);
    }
}