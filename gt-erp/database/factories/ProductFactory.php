<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    /**
     * The name of the corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure categories, brands, and unit of measures exist by running their seeders
        // before running ProductSeeder, or ensure they are created here if not found.
        $categoryId = Category::inRandomOrder()->first()->id ?? Category::factory()->create()->id;
        $brandId = Brand::inRandomOrder()->first()->id ?? Brand::factory()->create()->id;
        $unitOfMeasureId = UnitOfMeasure::inRandomOrder()->first()->id ?? UnitOfMeasure::factory()->create()->id;

        return [
            'name' => $this->faker->words(3, true) . ' ' . $this->faker->unique()->word() . ' Part',
            'part_number' => Str::upper($this->faker->unique()->bothify('??###??')),
            'description' => $this->faker->sentence(),
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'unit_of_measure_id' => $unitOfMeasureId,
            'reorder_level' => $this->faker->numberBetween(5, 20),
            'status' => $this->faker->randomElement(['active', 'deactive']),
        ];
    }
}
