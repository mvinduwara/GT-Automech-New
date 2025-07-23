<?php

namespace Database\Factories;

use App\Models\Stock;
use App\Models\Product; // Import the Product model
use Illuminate\Database\Eloquent\Factories\Factory;

class StockFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Stock::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get all existing product IDs.
        // This assumes you have at least one product in the database.
        $productIds = Product::pluck('id')->toArray();

        // If for some reason there are no products, this will cause an error
        // as randomElement would be called on an empty array.
        // In a real application, you'd ensure products exist or handle this case.
        if (empty($productIds)) {
            throw new \Exception('No products found in the database. Please ensure you have at least one product before seeding stock.');
        }

        // Select a random product_id from existing products
        $productId = $this->faker->randomElement($productIds);

        // Optionally select an alternative_product_id, ensuring it's different from product_id
        // Filter out the selected product_id to avoid alternative being the same as main product
        $availableAlternativeProductIds = array_diff($productIds, [$productId]);

        $alternativeProductId = null;
        if (!empty($availableAlternativeProductIds) && $this->faker->boolean(50)) { // 50% chance to have an alternative product
             $alternativeProductId = $this->faker->randomElement($availableAlternativeProductIds);
        }

        $buyingPrice = $this->faker->randomFloat(2, 10, 1000); // Random buying price between 10 and 1000
        $sellingPrice = $buyingPrice * $this->faker->randomFloat(2, 1.1, 2.5); // Selling price 10-150% higher than buying price

        return [
            'product_id' => $productId,
            'alternative_product_id' => $alternativeProductId,
            'quantity' => $this->faker->numberBetween(0, 500), // Random quantity between 0 and 500
            'buying_price' => $buyingPrice,
            'selling_price' => $sellingPrice,
            'status' => 'active', // Random status from defined types
        ];
    }
}

