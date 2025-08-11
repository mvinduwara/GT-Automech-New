<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PurchaseOrder extends Model
{
    /** @use HasFactory<\Database\Factories\PurchaseOrderFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'date',
        'status',
    ];

    /**
     * The "booted" method of the model.
     *
     * This is used to register model events.
     */
    protected static function booted(): void
    {
        // Automatically generate the purchase order name before creation.
        static::creating(function (PurchaseOrder $purchaseOrder) {
            $year = Carbon::now()->format('y');
            $month = Carbon::now()->format('m');
            $day = Carbon::now()->format('d');
            $randomString = Str::random(5);
            $purchaseOrder->name = "PO/{$year}/{$month}/{$day}/{$randomString}";
        });
    }

    /**
     * Get the purchase order items for the purchase order.
     *
     * @return HasMany<PurchaseOrderItem>
     */
    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
