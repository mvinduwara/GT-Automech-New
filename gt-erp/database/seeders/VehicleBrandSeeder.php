<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, truncate the table to avoid duplicates on re-seeding.
        Schema::disableForeignKeyConstraints();
        DB::table('vehicle_brands')->truncate();
        Schema::enableForeignKeyConstraints();

        $brands = [
            'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan',
            'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Hyundai',
            'Kia', 'Subaru', 'Mazda', 'Volvo', 'Jeep',
            'Land Rover', 'Porsche', 'Lexus', 'Cadillac', 'Tesla'
        ];

        foreach ($brands as $brandName) {
            VehicleBrand::factory()->create(['name' => $brandName]);
        }
    }
}