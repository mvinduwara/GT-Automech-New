<?php

namespace Database\Seeders;

use App\Models\Grn;
use App\Models\GrnItem;
use App\Models\GrnLedger;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Seeder;

class GrnSeeder extends Seeder
{
    public function run(): void
    {
        // Create 20 GRNs
        Grn::factory(20)->create()->each(function ($grn) {
            // Pick 1-3 random purchase-order-items that belong to the same PO
            $poItems = PurchaseOrderItem::where('purchase_order_id', $grn->purchase_order_id)
                ->inRandomOrder()
                ->limit(rand(1, 3))
                ->get();

            foreach ($poItems as $poItem) {
                // Create GrnItem
                $qty         = fake()->numberBetween(1, 50);
                $unitPrice   = fake()->randomFloat(2, 10, 1000);
                $totalPrice  = $qty * $unitPrice;

                $grnItem = GrnItem::create([
                    'grn_id'                 => $grn->id,
                    'purchase_order_item_id' => $poItem->id,
                    'stock_id'               => $poItem->stock_id,
                    'quantity'               => $qty,
                    'unit_price'             => $unitPrice,
                    'total_price'            => $totalPrice,
                    'remarks'                => fake()->sentence(),
                ]);

                // Create 1-2 GrnLedgers for each GrnItem
                foreach (range(1, rand(1, 2)) as $i) {
                    $debit  = fake()->randomFloat(2, 0,  5000);
                    $credit = fake()->randomFloat(2, 0,  5000);
                    GrnLedger::create([
                        'grn_id'     => $grn->id,
                        'date'       => fake()->dateTimeThisYear(),
                        'debit'      => $debit,
                        'credit'     => $credit,
                        'amount'     => $debit - $credit,
                        'remarks'    => fake()->sentence(),
                        'final_date' => fake()->optional()->dateTimeThisYear(),
                    ]);
                }
            }
        });
    }
}