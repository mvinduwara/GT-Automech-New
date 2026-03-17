<?php

use App\Models\Setting;
use App\Models\LedgerEntry;
use App\Models\PettyCashVoucher;
use App\Actions\Finance\CreateLedgerEntries;
use App\Models\Account;

// 1. Correct the settings
echo "Correcting settings...\n";
Setting::updateOrCreate(['key' => 'default_cash_account_id'], ['value' => '1']); // Cash & Bank
Setting::updateOrCreate(['key' => 'default_petty_cash_expense_account_id'], ['value' => '6']); // Petty Cash Expenses
echo "Settings updated.\n";

// 2. Identify regular vouchers and clean up their ledger entries
echo "Cleaning up ledger entries for regular vouchers...\n";
$regularVouchers = PettyCashVoucher::where('is_replenishment', false)->get();

foreach ($regularVouchers as $voucher) {
    echo "Processing Voucher #{$voucher->voucher_number}...\n";
    
    // Delete all existing ledger entries for this voucher
    $voucher->ledgerEntries()->delete();
    
    // If it's finalized, recreate the correct expenditure entry
    if ($voucher->status === 'finalized' && $voucher->actual_amount > 0) {
        $expenseAccount = Account::find(6);
        $drawerAccount = Account::find(9);
        
        if ($expenseAccount && $drawerAccount) {
            CreateLedgerEntries::run(
                description: "Petty cash expenditure for Voucher #{$voucher->voucher_number}",
                date: $voucher->finalized_at ?: now(),
                amount: (float) $voucher->actual_amount,
                debitAccount: $expenseAccount,
                creditAccount: $drawerAccount,
                transactionable: $voucher
            );
            echo "Recreated expenditure entry for #{$voucher->voucher_number}.\n";
        }
    }
}

// 3. For replenishment vouchers, ensure they have the correct entries
echo "Verifying replenishment vouchers...\n";
$replenishmentVouchers = PettyCashVoucher::where('is_replenishment', true)->get();
foreach ($replenishmentVouchers as $voucher) {
    if ($voucher->status === 'paid' || $voucher->status === 'finalized') {
        // If they have no entries, we might want to recreate them too, 
        // but let's just leave them if they have entries for now.
        if ($voucher->ledgerEntries()->count() === 0) {
            $drawerAccount = Account::find(9);
            $bankAccount = Account::find(1);
            
            CreateLedgerEntries::run(
                description: "Petty cash replenishment for Voucher #{$voucher->voucher_number}",
                date: $voucher->date,
                amount: (float) $voucher->requested_amount,
                debitAccount: $drawerAccount,
                creditAccount: $bankAccount,
                transactionable: $voucher
            );
             echo "Recreated replenishment entry for #{$voucher->voucher_number}.\n";
        }
    }
}

echo "Cleanup complete.\n";
