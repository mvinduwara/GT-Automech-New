<?php

namespace Database\Seeders;

use App\Models\VehicleService;
use Illuminate\Database\Seeder;

class VehicleServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Body Wash',
                'status' => 'active',
                'options' => [
                    ['name' => 'Basic Wash', 'price' => 500, 'status' => 'active'],
                    ['name' => 'Premium Wash', 'price' => 800, 'status' => 'active'],
                    ['name' => 'Deluxe Wash', 'price' => 1200, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Under Wash',
                'status' => 'active',
                'options' => [
                    ['name' => 'Standard Under Wash', 'price' => 300, 'status' => 'active'],
                    ['name' => 'High Pressure Under Wash', 'price' => 500, 'status' => 'active']
                ]
            ],
            [
                'name' => 'QD (Quick Detailing)',
                'status' => 'active',
                'options' => [
                    ['name' => 'Interior QD', 'price' => 1000, 'status' => 'active'],
                    ['name' => 'Exterior QD', 'price' => 1200, 'status' => 'active'],
                    ['name' => 'Full QD', 'price' => 2000, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Change Oil and Filter',
                'status' => 'active',
                'options' => [
                    ['name' => 'Standard Service', 'price' => 2000, 'status' => 'active'],
                    ['name' => 'Premium Service', 'price' => 2500, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Under Wax',
                'status' => 'active',
                'options' => [
                    ['name' => 'Standard Under Wax', 'price' => 1500, 'status' => 'active'],
                    ['name' => 'Premium Under Wax', 'price' => 2200, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Body Gas',
                'status' => 'active',
                'options' => [
                    ['name' => 'Standard Body Gas', 'price' => 800, 'status' => 'active'],
                    ['name' => 'Premium Body Gas', 'price' => 1200, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Cleaning Engine',
                'status' => 'active',
                'options' => [
                    ['name' => 'Basic Engine Clean', 'price' => 2500, 'status' => 'active'],
                    ['name' => 'Deep Engine Clean', 'price' => 4000, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Cleaning Brake',
                'status' => 'active',
                'options' => [
                    ['name' => 'Brake System Clean', 'price' => 1800, 'status' => 'active'],
                    ['name' => 'Complete Brake Service', 'price' => 3500, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Mechanic Inspection',
                'status' => 'active',
                'options' => [
                    ['name' => 'Basic Inspection', 'price' => 1000, 'status' => 'active'],
                    ['name' => 'Comprehensive Inspection', 'price' => 2000, 'status' => 'active'],
                    ['name' => 'Pre-purchase Inspection', 'price' => 3000, 'status' => 'active']
                ]
            ],
            [
                'name' => 'Scanning',
                'status' => 'active',
                'options' => [
                    ['name' => 'Basic OBD Scan', 'price' => 1500, 'status' => 'active'],
                    ['name' => 'Advanced Diagnostic', 'price' => 3000, 'status' => 'active'],
                    ['name' => 'Complete System Scan', 'price' => 4500, 'status' => 'active']
                ]
            ]
        ];

        foreach ($services as $serviceData) {
            $service = VehicleService::create([
                'name' => $serviceData['name'],
                'status' => $serviceData['status'],
            ]);

            foreach ($serviceData['options'] as $optionData) {
                $service->options()->create($optionData);
            }
        }
    }
}