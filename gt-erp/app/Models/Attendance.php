<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'clock_in',
        'clock_out',
        'status',
        'late_minutes',
        'overtime_minutes',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        // 'clock_in' => 'datetime', // Sometimes useful to cast time, but string is often safer for pure time columns unless using Carbon
        // 'clock_out' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
