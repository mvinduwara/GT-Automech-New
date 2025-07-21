<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UnitOfMeasures;

class UnitOfMeasuresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $uoms = [
            ['name' => 'Liter', 'abbreviation' => 'L'],
            ['name' => 'Kilogram', 'abbreviation' => 'KG'],
            ['name' => 'Piece', 'abbreviation' => 'PC'],
            ['name' => 'Meter', 'abbreviation' => 'M'],
            ['name' => 'Set', 'abbreviation' => 'SET'],
            ['name' => 'Gallon', 'abbreviation' => 'GAL'],
            ['name' => 'Pair', 'abbreviation' => 'PR'],
            ['name' => 'Can', 'abbreviation' => 'CAN'],
            ['name' => 'Bottle', 'abbreviation' => 'BTL'],
            ['name' => 'Roll', 'abbreviation' => 'ROLL'],
        ];

        foreach ($uoms as $uom) {
            UnitOfMeasures::firstOrCreate(
                ['name' => $uom['name']],
                ['abbreviation' => $uom['abbreviation'], 'status' => 'active']
            );
        }
    }
}

