<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product; // Import the Product model (still needed for count check)
use App\Models\Stock;   // Import the Stock model

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if there are enough products to create 30 stock records.
        // This is a safeguard, but no new products will be generated here.
        if (Product::count() < 30) {
            $this->command->warn('Less than 30 products found. Seeding will proceed with existing products, but you might not get 30 unique product_id assignments if product count is very low.');
            // You might want to throw an exception here if 30 products are strictly required.
            // throw new \Exception('Not enough products in the database to seed 30 stock records.');
        }

        // Create 30 stock records using the StockFactory.
        // The factory will automatically pick existing product_ids.
        Stock::factory()->count(30)->create();

        $this->command->info('30 stock records seeded successfully using existing products!');
    }
}

