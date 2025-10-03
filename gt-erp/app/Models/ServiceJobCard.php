<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceJobCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_card_id',
        'oil',
        'oil_filter',
        'drain_plug_seal',
        'ac',
        'electronic',
        'mechanical',
        'status',
    ];

    /**
     * Relationships
     */

    public function jobCard()
    {
        return $this->belongsTo(JobCard::class);
    }

    public function oilItem()
    {
        return $this->belongsTo(Stock::class, 'oil');
    }

    public function oilFilterItem()
    {
        return $this->belongsTo(Stock::class, 'oil_filter');
    }

    public function drainPlugSealItem()
    {
        return $this->belongsTo(Stock::class, 'drain_plug_seal');
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
}
