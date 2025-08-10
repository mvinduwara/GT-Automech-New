<?php

namespace Database\Factories;

use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Vehicle::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get a random brand and a model associated with that brand.
        $brand = VehicleBrand::inRandomOrder()->first();
        $model = $brand ? $brand->models()->inRandomOrder()->first() : null;

        return [
            'vehicle_no' => 'V' . fake()->unique()->randomNumber(5),
            'vehicle_brand_id' => $brand ? $brand->id : null,
            'vehicle_model_id' => $model ? $model->id : null,
            'make_year' => fake()->numberBetween(2000, 2024),
        ];
    }
}
