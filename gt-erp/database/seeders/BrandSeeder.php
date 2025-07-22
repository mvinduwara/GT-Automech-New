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
        $brands = [
            ['name' => 'Toyota', 'description' => 'Genuine and aftermarket parts for Toyota vehicles.'],
            ['name' => 'Honda', 'description' => 'Genuine and aftermarket parts for Honda vehicles.'],
            ['name' => 'Suzuki', 'description' => 'Genuine and aftermarket parts for Suzuki vehicles.'],
            ['name' => 'Mitsubishi', 'description' => 'Genuine and aftermarket parts for Mitsubishi vehicles.'],
            ['name' => 'Nissan', 'description' => 'Genuine and aftermarket parts for Nissan vehicles.'],
            ['name' => 'Masuma', 'description' => 'Aftermarket automotive spare parts.'],
            ['name' => 'CWORKS', 'description' => 'Quality aftermarket parts.'],
            ['name' => 'Mobil', 'description' => 'Engine oils and lubricants.'],
            ['name' => 'Castrol', 'description' => 'Engine oils and lubricants.'],
            ['name' => 'Caltex', 'description' => 'Engine oils and lubricants.'],
            ['name' => 'King Steel', 'description' => 'Chassis and suspension parts.'],
            ['name' => 'CAC', 'description' => 'Brake system components.'],
            ['name' => 'Wurth', 'description' => 'Automotive chemicals, fasteners, and tools.'],
            ['name' => 'FBK', 'description' => 'Brake system components.'],
            ['name' => 'eni', 'description' => 'Lubricants and fuels.'],
            ['name' => 'Maximile', 'description' => 'Automotive lubricants.'],
            ['name' => 'Panda', 'description' => 'Aftermarket parts for various models.'],
            ['name' => 'Sakura', 'description' => 'Filters and other automotive parts.'],
            ['name' => 'VIC', 'description' => 'Filters and other automotive parts.'],
            ['name' => 'Fleetguard', 'description' => 'Heavy-duty filtration products.'],
            ['name' => 'BOSCH', 'description' => 'Automotive technology and parts.'],
            ['name' => 'Dimo', 'description' => 'Parts for Dimo vehicles (e.g., TATA).'],
            ['name' => 'NGK', 'description' => 'Spark plugs and ignition components.'],
            ['name' => 'Monroe', 'description' => 'Shock absorbers and struts.'],
            ['name' => 'KYB', 'description' => 'Shock absorbers and suspension components.'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(
                ['name' => $brand['name']],
                ['description' => $brand['description'], 'status' => 'active']
            );
        }
    }
}
