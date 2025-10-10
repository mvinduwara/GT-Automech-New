<?php

namespace App\Actions\Finance;

use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CreateLedgerEntries
{
    public static function run(string $description, \DateTimeInterface $date, float $amount, Account $debitAccount, Account $creditAccount, Model $transactionable)
    {
        DB::transaction(function () use ($description, $date, $amount, $debitAccount, $creditAccount, $transactionable) {

            LedgerEntry::create([
                'account_id' => $debitAccount->id,
                'date' => $date,
                'description' => $description,
                'debit' => $amount,
                'transactionable_type' => get_class($transactionable),
                'transactionable_id' => $transactionable->id,
            ]);

            LedgerEntry::create([
                'account_id' => $creditAccount->id,
                'date' => $date,
                'description' => $description,
                'credit' => $amount,
                'transactionable_type' => get_class($transactionable),
                'transactionable_id' => $transactionable->id,
            ]);
        });
    }
}
