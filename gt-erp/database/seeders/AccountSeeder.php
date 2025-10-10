<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Account::insert([
            // Assets
            ['name' => 'Cash & Bank', 'code' => '1000', 'type' => 'asset'],
            ['name' => 'Accounts Receivable', 'code' => '1100', 'type' => 'asset'],
            ['name' => 'Inventory', 'code' => '1200', 'type' => 'asset'],

            // Liabilities
            ['name' => 'Accounts Payable', 'code' => '2000', 'type' => 'liability'],

            // Income
            ['name' => 'Sales Revenue', 'code' => '4000', 'type' => 'income'],

            // Expenses
            ['name' => 'Petty Cash Expenses', 'code' => '5000', 'type' => 'expense'],
        ]);
    }
}
