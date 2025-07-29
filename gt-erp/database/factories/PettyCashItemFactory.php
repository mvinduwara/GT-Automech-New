<?php

namespace Database\Factories;

use App\Models\PettyCashItem;
use App\Models\PettyCashVoucher;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

class PettyCashItemFactory extends Factory
{
    /**
     * The name of the corresponding model.
     *
     * @var string
     */
    protected $model = PettyCashItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure there are vouchers and accounts available
        $voucher = PettyCashVoucher::inRandomOrder()->first() ?? PettyCashVoucher::factory()->create();

        $quantity = $this->faker->numberBetween(1, 10);
        $unitPrice = $this->faker->randomFloat(2, 1, 100);
        $amount = $quantity * $unitPrice;

        return [
            'petty_cash_voucher_id' => $voucher->id,
            'item_description' => $this->faker->sentence(3),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'amount' => $amount,
            'checked' => $this->faker->boolean(50),
        ];
    }
}