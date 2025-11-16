<?php

namespace Database\Factories;

use App\Models\Grn;
use Illuminate\Database\Eloquent\Factories\Factory;

class GrnFactory extends Factory
{
    protected $model = Grn::class;

    public function definition(): array
    {
        return [
            'grn_no'            => 'GRN/' . fake()->unique()->regexify('[0-9]{6}'),
            'supplier_id'       => fake()->numberBetween(1, 20),
            'purchase_order_id' => fake()->numberBetween(1, 48),
            'user_id'           => 1,
            'date'              => fake()->dateTimeThisYear(),
            'remarks'           => fake()->sentence(),
            'status'            => fake()->randomElement(['pending', 'complete']),
        ];
    }
}