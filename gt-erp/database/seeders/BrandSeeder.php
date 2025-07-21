<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define specific brands suitable for a vehicle repair center
        $brands = [
            ['name' => 'Bosch', 'description' => 'Leading supplier of automotive technology.'],
            ['name' => 'Denso', 'description' => 'Global automotive components manufacturer.'],
            ['name' => 'ACDelco', 'description' => 'GM\'s original equipment parts brand.'],
            ['name' => 'Motorcraft', 'description' => 'Ford Motor Company\'s parts brand.'],
            ['name' => 'NGK', 'description' => 'Specializes in spark plugs and oxygen sensors.'],
            ['name' => 'Brembo', 'description' => 'High-performance braking systems.'],
            ['name' => 'Monroe', 'description' => 'Manufacturer of shock absorbers and struts.'],
            ['name' => 'KYB', 'description' => 'Global leader in hydraulic and suspension technology.'],
            ['name' => 'Michelin', 'description' => 'Renowned tire manufacturer.'],
            ['name' => 'Goodyear', 'description' => 'One of the world\'s largest tire companies.'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(
                ['name' => $brand['name']],
                ['description' => $brand['description'], 'status' => 'active']
            );
        }
    }
}

