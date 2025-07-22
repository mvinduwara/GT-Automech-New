<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Filter, AC', 'description' => 'Air conditioning filters for various vehicle models.'],
            ['name' => 'Filter, Air', 'description' => 'Engine air filters for optimal performance.'],
            ['name' => 'Filter, Oil', 'description' => 'Oil filters for engine lubrication systems.'],
            ['name' => 'Filter, Fuel', 'description' => 'Fuel filters to ensure clean fuel delivery.'],
            ['name' => 'Oil, Engine', 'description' => 'Engine lubricants of various grades.'],
            ['name' => 'Brake Pads', 'description' => 'Brake pads for front and rear braking systems.'],
            ['name' => 'Spark Plug', 'description' => 'Spark plugs for ignition systems.'],
            ['name' => 'Link', 'description' => 'Stabilizer links and other suspension links.'],
            ['name' => 'Shock Absorber', 'description' => 'Shock absorbers for vehicle suspension.'],
            ['name' => 'Shock Mount', 'description' => 'Mounting components for shock absorbers.'],
            ['name' => 'Boot', 'description' => 'Protective boots for various automotive components.'],
            ['name' => 'Damper', 'description' => 'Dampers for suspension and vibration control.'],
            ['name' => 'Rack End', 'description' => 'Rack ends for steering systems.'],
            ['name' => 'Ball Joint', 'description' => 'Ball joints for suspension and steering.'],
            ['name' => 'Tie Rod End', 'description' => 'Tie rod ends for steering linkage.'],
            ['name' => 'Wiper Blade', 'description' => 'Windshield wiper blades.'],
            ['name' => 'Hub Unit', 'description' => 'Wheel hub units for various axles.'],
            ['name' => 'Miscellaneous', 'description' => 'General automotive accessories and small parts.'],
            ['name' => 'Belts & Hoses', 'description' => 'Drive belts and various hoses.'],
            ['name' => 'Lighting', 'description' => 'Headlights, tail lights, and interior lights.'],
            ['name' => 'Batteries', 'description' => 'Automotive batteries.'],
            ['name' => 'Cooling System', 'description' => 'Radiators, water pumps, and cooling components.'],
            ['name' => 'Steering System', 'description' => 'Power steering components and steering racks.'],
            ['name' => 'Transmission', 'description' => 'Transmission fluids and components.'],
            ['name' => 'Gaskets & Seals', 'description' => 'Various gaskets and seals for engine and other parts.'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description'], 'status' => 'active']
            );
        }
    }
}
