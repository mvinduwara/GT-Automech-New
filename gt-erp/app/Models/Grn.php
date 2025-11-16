<?php

// File: app/Models/Grn.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grn extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'grn_no',
        'supplier_id',
        'purchase_order_id',
        'user_id',
        'date',
        'remarks',
        'status',
    ];

    /**
     * Get the supplier that owns the GRN.
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who created the GRN.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the purchase order that is related to the GRN.
     */
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the GRN items for the GRN.
     */
    public function grnItems()
    {
        return $this->hasMany(GrnItem::class);
    }
}