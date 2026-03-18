<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::orderBy('type')
            ->orderBy('name')
            ->get();

        // Calculate current balance for each account
        $accounts->transform(function ($account) {
            $ledgerBalance = $account->ledgerEntry()
                ->selectRaw('SUM(debit) - SUM(credit) as balance')
                ->value('balance') ?: 0;
            
            // For Income and Liability, balance is usually Credit - Debit
            // For Asset and Expense, balance is usually Debit - Credit
            // But we'll keep it simple for now as requested or standard "Debit - Credit"
            $account->current_balance = (float)$account->opening_balance + (float)$ledgerBalance;
            return $account;
        });

        return Inertia::render('accounts/index', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:accounts,code',
            'type' => 'required|in:asset,liability,equity,income,expense',
            'description' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        Account::create($validated);

        return redirect()->back()->with('success', 'Account created successfully.');
    }

    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:accounts,code,' . $account->id,
            'type' => 'required|in:asset,liability,equity,income,expense',
            'description' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        $account->update($validated);

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Account $account)
    {
        // Check if account has ledger entries
        if ($account->ledgerEntry()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete account that has recorded transactions.');
        }

        $account->delete();

        return redirect()->back()->with('success', 'Account deleted successfully.');
    }
}
