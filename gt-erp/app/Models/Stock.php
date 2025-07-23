<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'alternative_product_id',
        'quantity',
        'buying_price',
        'selling_price',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'buying_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'status' => 'string', // e.g., 'active', 'inactive'
    ];

    /**
     * Get the main product associated with the stock.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Get the alternative product associated with the stock.
     */
    public function alternativeProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'alternative_product_id');
    }
}

