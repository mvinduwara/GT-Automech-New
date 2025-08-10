<?php

namespace Database\Factories;

use App\Models\VehicleModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleModel>
 */
class VehicleModelFactory extends Factory
{
     protected $model = VehicleModel::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // A curated list of common car models to ensure real-world data.
        // We'll create a total of 50 models across the 20 brands in the seeder.
        $carModels = [
            'Corolla', 'Camry', 'RAV4', 'Highlander', 'Tacoma', 'Tundra',
            'Civic', 'Accord', 'CR-V', 'Pilot', 'Ridgeline',
            'F-150', 'Explorer', 'Escape', 'Mustang', 'Ranger',
            'Silverado', 'Equinox', 'Traverse', 'Tahoe', 'Corvette',
            'Rogue', 'Sentra', 'Altima', 'Titan',
            '3 Series', 'X3', 'X5', '5 Series',
            'C-Class', 'E-Class', 'GLC', 'GLE',
            'A3', 'A4', 'Q5', 'Q7',
            'Golf', 'Jetta', 'Tiguan', 'Passat',
            'Elantra', 'Sonata', 'Tucson', 'Santa Fe',
            'Telluride', 'Sorento', 'K5', 'Sportage',
            'Outback', 'Forester', 'Crosstrek', 'Impreza',
            'CX-5', 'Mazda3', 'CX-9', 'Miata',
            'XC90', 'XC60', 'S60',
            'Wrangler', 'Grand Cherokee', 'Cherokee',
            'Defender', 'Discovery',
            '911', 'Cayenne', 'Macan',
            'RX', 'ES', 'GX',
            'Escalade', 'CT5', 'XT5',
            'Model S', 'Model 3', 'Model X', 'Model Y',
            'A4 Avant', 'GT-R', 'Bronco Sport', 'Enclave', 'XT6', 'M3 Sedan', 'GLE Coupe'
        ];

        return [
            // The seeder will provide the `vehicle_brand_id`.
            'name' => fake()->randomElement($carModels),
        ];
    }
}
