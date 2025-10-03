<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobCard extends Model
{

    protected $fillable = [
        'job_card_no',
        'vehicle_id',
        'customer_id',
        'user_id',
        'mileage',
        'date',
        'remarks',
        'type',
        'status',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function jobCardVehicleServices(): HasMany
    {
        return $this->hasMany(JobCardVehicleService::class);
    }

    public function serviceJobCard(): HasOne
    {
        return $this->hasOne(ServiceJobCard::class);
    }

    public function includedServices(): HasMany
    {
        return $this->hasMany(JobCardVehicleService::class)
            ->where('is_included', true);
    }

    public function getServiceTotalAttribute(): float
    {
        return $this->jobCardVehicleServices
            ->where('is_included', true)
            ->sum(function ($service) {
                return $service->vehicleServiceOption->price ?? 0;
            });
    }
}
