<?php

use App\Models\PettyCashVoucher;
use App\Models\Account;
use App\Actions\Finance\CreateLedgerEntries;

$amount = 150000 + 322550; // Target 150k + covering currently recorded expenses

$voucher = PettyCashVoucher::create([
    'voucher_number' => 'PCV-INIT-001',
    'date' => now(),
    'requested_by_user_id' => 1,
    'name' => 'Initial Imprest Setup',
    'description' => 'Opening balance setup to reach target imprest 150,000',
    'requested_amount' => $amount,
    'actual_amount' => $amount,
    'total_amount' => $amount,
    'status' => 'finalized',
    'is_replenishment' => true,
    'finalized_at' => now(),
]);

CreateLedgerEntries::run(
    description: 'Initial Imprest Setup',
    date: now(),
    amount: (float) $amount,
    debitAccount: Account::find(9),
    creditAccount: Account::find(1),
    transactionable: $voucher
);

echo "Done. New balance should be 150,000.\n";
