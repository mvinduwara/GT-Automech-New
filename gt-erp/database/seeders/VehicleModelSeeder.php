<?php

// File: database/seeders/VehicleModelSeeder.php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, truncate the table to avoid duplicates on re-seeding.
        Schema::disableForeignKeyConstraints();
        DB::table('vehicle_models')->truncate();
        Schema::enableForeignKeyConstraints();

        $brands = VehicleBrand::all();

        // Check if brands exist before creating models
        if ($brands->isEmpty()) {
            $this->command->error('No vehicle brands found. Please run VehicleBrandSeeder first.');
            return;
        }

        // A curated list of car models. We'll use a larger list to ensure uniqueness
        // and a good variety for the 50 models we need.
        $carModels = [
            'Corolla', 'Camry', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', 'Supra', 'Prius',
            'Civic', 'Accord', 'CR-V', 'Pilot', 'Ridgeline', 'HR-V', 'Odyssey',
            'F-150', 'Explorer', 'Escape', 'Mustang', 'Ranger', 'Bronco', 'Focus',
            'Silverado', 'Equinox', 'Traverse', 'Tahoe', 'Corvette', 'Camaro', 'Malibu',
            'Rogue', 'Sentra', 'Altima', 'Titan', 'Frontier', 'GT-R',
            '3 Series', 'X3', 'X5', '5 Series', '7 Series', 'M3',
            'C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class',
            'A3', 'A4', 'Q5', 'Q7', 'A6',
            'Golf', 'Jetta', 'Tiguan', 'Passat', 'Atlas',
            'Elantra', 'Sonata', 'Tucson', 'Santa Fe',
            'Telluride', 'Sorento', 'K5', 'Sportage', 'Forte',
            'Outback', 'Forester', 'Crosstrek', 'Impreza', 'Ascent',
            'CX-5', 'Mazda3', 'CX-9', 'Miata',
            'XC90', 'XC60', 'S60',
            'Wrangler', 'Grand Cherokee', 'Cherokee',
            'Defender', 'Discovery', 'Range Rover',
            '911', 'Cayenne', 'Macan',
            'RX', 'ES', 'GX',
            'Escalade', 'CT5', 'XT5',
            'Model S', 'Model 3', 'Model X', 'Model Y',
        ];

        // We will create exactly 50 models, each with a random brand ID.
        for ($i = 0; $i < 50; $i++) {
            VehicleModel::factory()->create([
                'name' => fake()->unique()->randomElement($carModels),
                'vehicle_brand_id' => $brands->random()->id,
            ]);
        }
    }
}