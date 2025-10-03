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
    ];

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
