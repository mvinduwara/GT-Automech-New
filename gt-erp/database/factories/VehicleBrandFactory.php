<?php

namespace Database\Factories;

use App\Models\VehicleBrand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleBrand>
 */
class VehicleBrandFactory extends Factory
{
    protected $model = VehicleBrand::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = [
            'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan',
            'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Hyundai',
            'Kia', 'Subaru', 'Mazda', 'Volvo', 'Jeep',
            'Land Rover', 'Porsche', 'Lexus', 'Cadillac', 'Tesla'
        ];

        return [
            'name' => fake()->unique()->randomElement($brands),
        ];
    }
}
