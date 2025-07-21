<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Brand::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = [
            'Bosch', 'Denso', 'ACDelco', 'Motorcraft', 'NGK',
            'Brembo', 'Monroe', 'KYB', 'Michelin', 'Goodyear'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($brands),
            'description' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['active', 'deactive']),
        ];
    }
}

