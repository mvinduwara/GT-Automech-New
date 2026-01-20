<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'purchase_order_id',
        'stock_id',
        'product_id',
        'quantity',
        'is_approved',
    ];

    /**
     * Get the purchase order that owns the purchase order item.
     *
     * @return BelongsTo<PurchaseOrder>
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the stock item that the purchase order item refers to.
     *
     * @return BelongsTo<Stock>
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function grnItems(): HasMany
    {
        return $this->hasMany(GrnItem::class);
    }
}
