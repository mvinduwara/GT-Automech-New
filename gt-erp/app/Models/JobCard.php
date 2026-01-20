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
        'ac',
        'electronic',
        'mechanical',
        'service_types',
    ];

    protected $casts = [
        'service_types' => 'array',
        'date' => 'date',
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
    public function jobCardCharges(): HasMany
    {
        return $this->hasMany(JobCardCharges::class);
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

    public function jobCardProducts(): HasMany
    {
        return $this->hasMany(JobCardProducts::class);
    }

    public function getProductsTotalAttribute(): float
    {
        return $this->jobCardProducts->sum('total');
    }

    public function acTechnician()
    {
        return $this->belongsTo(Employee::class, 'ac');
    }

    public function electronicTechnician()
    {
        return $this->belongsTo(Employee::class, 'electronic');
    }

    public function mechanicalTechnician()
    {
        return $this->belongsTo(Employee::class, 'mechanical');
    }

    // Add this to your existing JobCard.php model

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function hasInvoice(): bool
    {
        return $this->invoice()->exists();
    }

    public function insurance(): HasOne
    {
        return $this->hasOne(Insurance::class);
    }

    public function hasInsurance(): bool
    {
        return $this->insurance()->exists();
    }

    public function getGrandTotalAttribute(): float
    {
        $servicesTotal = $this->jobCardVehicleServices()
            ->where('is_included', true)
            ->sum('total');

        $productsTotal = $this->jobCardProducts()->sum('total');

        $chargesTotal = $this->jobCardCharges()->sum('total');

        return $servicesTotal + $productsTotal + $chargesTotal;
    }
}
