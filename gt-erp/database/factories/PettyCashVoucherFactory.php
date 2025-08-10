<?php

namespace Database\Factories;

use App\Models\PettyCashVoucher;
use App\Models\User; // Assuming you have a User model
use Illuminate\Database\Eloquent\Factories\Factory;

class PettyCashVoucherFactory extends Factory
{
    /**
     * The name of the corresponding model.
     *
     * @var string
     */
    protected $model = PettyCashVoucher::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure there are users available for foreign keys
        $requestedBy = User::inRandomOrder()->first() ?? User::factory()->create();
        $approvedBy = User::inRandomOrder()->first() ?? User::factory()->create();

        return [
            'voucher_number' => 'PCV-' . $this->faker->unique()->randomNumber(5),
            'date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'name' => fake()->name(),
            'requested_by_user_id' => $requestedBy->id,
            'approved_by_user_id' => $this->faker->boolean(70) ? $approvedBy->id : null, // 70% chance of being approved
            'description' => $this->faker->sentence(),
            'total_amount' => $this->faker->randomFloat(2, 10, 500),
            'status' => $this->faker->randomElement(['pending', 'approved', 'paid', 'rejected']),
            'checked' => $this->faker->boolean(50),
        ];
    }
}
