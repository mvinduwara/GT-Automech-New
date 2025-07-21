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
        // Define specific categories suitable for a vehicle repair center
        $categories = [
            ['name' => 'Engine Parts', 'description' => 'Components related to vehicle engines.'],
            ['name' => 'Brake System', 'description' => 'Parts for the vehicle braking system.'],
            ['name' => 'Suspension', 'description' => 'Components for vehicle suspension and steering.'],
            ['name' => 'Electrical', 'description' => 'Electrical components and wiring.'],
            ['name' => 'Body Parts', 'description' => 'Exterior and interior body components.'],
            ['name' => 'Tires & Wheels', 'description' => 'Tires, rims, and related accessories.'],
            ['name' => 'Fluids & Lubricants', 'description' => 'Oils, coolants, brake fluid, etc.'],
            ['name' => 'Exhaust System', 'description' => 'Mufflers, pipes, catalytic converters.'],
            ['name' => 'Interior Accessories', 'description' => 'Dashboard, seats, and cabin components.'],
            ['name' => 'Tools & Equipment', 'description' => 'Workshop tools and diagnostic equipment.'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description'], 'status' => 'active']
            );
        }
    }
}

