<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobCardVehicleService extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_card_id',
        'vehicle_service_id',
        'vehicle_service_option_id',
        'is_included',
        'subtotal',
        'discount_type',
        'discount_value',
        'total',
    ];

    protected $casts = [
        'charge' => 'integer',
        'discount_value' => 'decimal:2',
        'total' => 'integer',
    ];

    public function calculateTotal(): int
    {
        $charge = $this->charge;
        $discountValue = $this->discount_value ?? 0;

        if ($this->discount_type === 'percentage') {
            $discountAmount = ($charge * $discountValue) / 100;
            return (int) ($charge - $discountAmount);
        } elseif ($this->discount_type === 'amount') {
            return (int) max(0, $charge - $discountValue);
        }

        return $charge;
    }

    public function vehicleService()
    {
        return $this->belongsTo(VehicleService::class);
    }

    public function vehicleServiceOption()
    {
        return $this->belongsTo(VehicleServiceOption::class);
    }

    public function jobCard()
    {
        return $this->belongsTo(JobCard::class);
    }
}
