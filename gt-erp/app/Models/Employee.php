<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory;
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'mobile',
        'hire_date',
        'job_title',
        'department_id',
        'status',
        'attendance_machine_id',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date:Y-m-d', // Corrected cast for date format
            'status' => 'string',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}