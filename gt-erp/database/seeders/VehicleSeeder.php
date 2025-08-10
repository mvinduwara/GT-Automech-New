<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, truncate the table to avoid duplicates on re-seeding.
        Schema::disableForeignKeyConstraints();
        DB::table('vehicles')->truncate();
        Schema::enableForeignKeyConstraints();

        Vehicle::factory()->count(100)->create();
    }
}