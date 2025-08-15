<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrnItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'grn_id',
        'purchase_order_item_id',
        'stock_id',
        'quantity',
        'unit_price',
        'total_price',
        'remarks',
    ];

    public function grn()
    {
        return $this->belongsTo(Grn::class);
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}