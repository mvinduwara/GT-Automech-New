<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = ['Mr', 'Mrs', 'Ms', 'Ven', 'Dr', 'Prof'];
        return [
            'title' => $this->faker->randomElement($titles),
            'name' => $this->faker->name(),
            'mobile' => $this->faker->unique()->phoneNumber(),
            'address' => $this->faker->address(),
        ];
    }
}
