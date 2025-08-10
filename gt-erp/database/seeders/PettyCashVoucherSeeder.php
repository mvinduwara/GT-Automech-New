<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PettyCashVoucher;
use App\Models\PettyCashItem;
use App\Models\User;
use App\Models\Account;

class PettyCashVoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure there are users and accounts before seeding vouchers and items
        if (User::count() == 0) {
            User::factory(10)->create(); // Create some dummy users if none exist
        }

        PettyCashVoucher::factory(20) // Create 20 dummy petty cash vouchers
            ->create()
            ->each(function ($voucher) {
                // For each voucher, create 1 to 5 petty cash items
                PettyCashItem::factory(rand(1, 5))->create([
                    'petty_cash_voucher_id' => $voucher->id,
                ]);

                // Recalculate and update the total_amount for the voucher
                $totalAmount = $voucher->items()->sum('amount');
                $voucher->update(['total_amount' => $totalAmount]);
            });
    }
}
