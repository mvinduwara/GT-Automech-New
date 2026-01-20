<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'part_number',
        'description',
        'category_id',
        'brand_id',
        'unit_of_measure_id',
        'reorder_level',
        'status',
        'deleted',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reorder_level' => 'integer',
        'status' => 'string',
        'deleted' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_deleted', function ($builder) {
            $builder->where('deleted', false);
        });
    }

    /**
     * Get the category that owns the product.
     */
    // public function category(): BelongsTo
    // {
    //     return $this->belongsTo(Category::class);
    // }

    /**
     * Get the brand that owns the product.
     */
    // public function brand(): BelongsTo
    // {
    //     return $this->belongsTo(Brand::class);
    // }

    public function category()
    {
        return $this->belongsTo(Category::class)->withDefault([
            'id' => null,
            'name' => 'Uncategorized' // Or 'N/A', 'No Category', etc.
        ]);
    }

    /**
     * Get the brand for the product.
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class)->withDefault([
            'id' => null,
            'name' => 'No Brand'
        ]);
    }

    /**
     * Get the unit of measure that owns the product.
     */
    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }

    /**
     * Get the stock records for the product.
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function getPriceAttribute(): ?float
    {
        return $this->stocks()->latest()->first()->selling_price ?? null;
    }

    /**
     * Get the total quantity in stock for this product.
     */
    public function getTotalStockAttribute(): int
    {
        return $this->stocks()->where('status', 'active')->sum('quantity');
    }

    /**
     * Check if product is low in stock.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->total_stock <= $this->reorder_level;
    }

    /**
     * The vehicle models that belong to the product.
     */
    public function vehicleModels()
    {
        return $this->belongsToMany(VehicleModel::class, 'product_vehicle_model');
    }
}