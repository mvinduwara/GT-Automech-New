<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitOfMeasures extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'abbreviation',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }
}
