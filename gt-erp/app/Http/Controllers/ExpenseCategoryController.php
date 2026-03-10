<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $categories = Account::where('type', 'expense')
            ->orderBy('name')
            ->get();

        return Inertia::render('expense/categories/index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:accounts,name',
            'code' => 'nullable|string|max:50|unique:accounts,code',
            'description' => 'nullable|string',
        ]);

        $validated['type'] = 'expense';

        Account::create($validated);

        return redirect()->back()->with('success', 'Expense category created successfully.');
    }

    public function update(Request $request, Account $account)
    {
        if ($account->type !== 'expense') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:accounts,name,' . $account->id,
            'code' => 'nullable|string|max:50|unique:accounts,code,' . $account->id,
            'description' => 'nullable|string',
        ]);

        $account->update($validated);

        return redirect()->back()->with('success', 'Expense category updated successfully.');
    }

    public function destroy(Account $account)
    {
        if ($account->type !== 'expense') {
            abort(403, 'Unauthorized action.');
        }

        // Check if category has expenses
        if ($account->expenses()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category that has recorded expenses.');
        }

        $account->delete();

        return redirect()->back()->with('success', 'Expense category deleted successfully.');
    }
}
