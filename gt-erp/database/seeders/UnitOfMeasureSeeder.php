<?php

namespace Database\Seeders;

use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;

class UnitOfMeasureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $uoms = [
            ['name' => 'Each', 'abbreviation' => 'Each'],
            ['name' => 'Liter', 'abbreviation' => 'L'],
            ['name' => 'Kilogram', 'abbreviation' => 'KG'],
            ['name' => 'Set', 'abbreviation' => 'Set'],
            ['name' => 'Meter', 'abbreviation' => 'M'],
            ['name' => 'Pair', 'abbreviation' => 'Pair'],
            ['name' => 'Can', 'abbreviation' => 'Can'],
            ['name' => 'Bottle', 'abbreviation' => 'Btl'],
            ['name' => 'Roll', 'abbreviation' => 'Roll'],
            ['name' => 'Gallon', 'abbreviation' => 'Gal'],
            ['name' => 'Box', 'abbreviation' => 'Box'],
            ['name' => 'Pack', 'abbreviation' => 'Pack'],
        ];

        foreach ($uoms as $uom) {
            UnitOfMeasure::firstOrCreate(
                ['name' => $uom['name']],
                ['abbreviation' => $uom['abbreviation'], 'status' => 'active']
            );
        }
    }
}
