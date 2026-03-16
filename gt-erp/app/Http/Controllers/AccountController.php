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
