<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    /**
     * Get all GRN Items associated with this stock.
     */
    public function grnItems(): HasMany
    {
        return $this->hasMany(GrnItem::class);
    }

    /**
     * Get all Job Card Products associated with this stock.
     */
    public function jobCardProducts(): HasMany
    {
        return $this->hasMany(JobCardProducts::class);
    }

    /**
     * Get all stock items that list this as an alternative.
     */
    public function alternativeFor(): HasMany
    {
        return $this->hasMany(Stock::class, 'alternative_product_id');
    }

    /**
     * Check if this stock item has any transaction history.
     */
    public function hasTransactions(): bool
    {
        // Load counts for all relationships
        $this->loadCount(['purchaseOrderItems', 'grnItems', 'jobCardProducts', 'alternativeFor']);

        return $this->purchase_order_items_count > 0 ||
            $this->grn_items_count > 0 ||
            $this->job_card_products_count > 0 ||
            $this->alternative_for_count > 0;
    }
}
