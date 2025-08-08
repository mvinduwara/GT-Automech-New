<?php

namespace App\Models;

use App\Enums\VehicleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleServiceOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_service_id',
        'name',
        'price',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function vehicleService(): BelongsTo
    {
        return $this->belongsTo(VehicleService::class);
    }
}