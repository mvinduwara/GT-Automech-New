<?php

// app/Http/Controllers/Reports/FinancialReportController.php
namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FinancialReportController extends Controller
{
    public function profitAndLoss(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        // 1. Get total income
        $incomeAccountIds = Account::where('type', 'income')->pluck('id');
        $totalIncome = LedgerEntry::whereIn('account_id', $incomeAccountIds)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('credit');

        // 2. Get total expenses
        $expenseAccountIds = Account::where('type', 'expense')->pluck('id');
        $totalExpenses = LedgerEntry::whereIn('account_id', $expenseAccountIds)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('debit');

        // 3. Calculate Net Profit
        $netProfit = $totalIncome - $totalExpenses;

        // For an API response (if needed)
        // return response()->json([...]);

        // For Inertia
        return inertia('reports/profit-loss', [
            'reportData' => [
                'totalIncome' => (float) $totalIncome,
                'totalExpenses' => (float) $totalExpenses,
                'netProfit' => (float) $netProfit,
            ],
            'filters' => $validated,
        ]);
    }
}