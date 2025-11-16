<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // --- Financial Summary Logic ---
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now()->endOfMonth();

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

        // 4. Generate chart data (monthly breakdown)
        $chartData = $this->generateChartData($startDate, $endDate, $incomeAccountIds, $expenseAccountIds);

        // 5. Get expenses by category
        $expensesByCategory = $this->getExpensesByCategory($startDate, $endDate);

        // 6. Get income by category
        $incomeByCategory = $this->getIncomeByCategory($startDate, $endDate);

        $financialSummary = [
            'totalIncome' => (float) $totalIncome,
            'totalExpenses' => (float) $totalExpenses,
            'netProfit' => (float) $netProfit,
            'filters' => [
                'startDate' => $startDate->toDateString(),
                'endDate' => $endDate->toDateString(),
            ],
            'chartData' => $chartData,
            'expensesByCategory' => $expensesByCategory,
            'incomeByCategory' => $incomeByCategory,
        ];

        return Inertia::render('dashboard', [
            'financialSummary' => $financialSummary
        ]);
    }

    private function generateChartData($startDate, $endDate, $incomeAccountIds, $expenseAccountIds)
    {
        $chartData = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $monthStart = $currentDate->copy()->startOfMonth();
            $monthEnd = $currentDate->copy()->endOfMonth();

            // Don't go beyond the end date
            if ($monthEnd > $endDate) {
                $monthEnd = $endDate->copy();
            }

            $income = LedgerEntry::whereIn('account_id', $incomeAccountIds)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('credit');

            $expenses = LedgerEntry::whereIn('account_id', $expenseAccountIds)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('debit');

            $chartData[] = [
                'month' => $monthStart->format('M Y'),
                'income' => (float) $income,
                'expenses' => (float) $expenses,
                'profit' => (float) ($income - $expenses),
            ];

            $currentDate->addMonth();
        }

        return $chartData;
    }

    private function getExpensesByCategory($startDate, $endDate)
    {
        $expenses = LedgerEntry::join('accounts', 'ledger_entries.account_id', '=', 'accounts.id')
            ->where('accounts.type', 'expense')
            ->whereBetween('ledger_entries.date', [$startDate, $endDate])
            ->select('accounts.name', DB::raw('SUM(ledger_entries.debit) as total'))
            ->groupBy('accounts.name')
            ->orderByDesc('total')
            ->limit(8) // Limit to top 8 categories for better visualization
            ->get();

        return $expenses->map(function ($expense) {
            return [
                'name' => $expense->name,
                'value' => (float) $expense->total,
            ];
        })->toArray();
    }

    private function getIncomeByCategory($startDate, $endDate)
    {
        $income = LedgerEntry::join('accounts', 'ledger_entries.account_id', '=', 'accounts.id')
            ->where('accounts.type', 'income')
            ->whereBetween('ledger_entries.date', [$startDate, $endDate])
            ->select('accounts.name', DB::raw('SUM(ledger_entries.credit) as total'))
            ->groupBy('accounts.name')
            ->orderByDesc('total')
            ->limit(8) // Limit to top 8 categories for better visualization
            ->get();

        return $income->map(function ($inc) {
            return [
                'name' => $inc->name,
                'value' => (float) $inc->total,
            ];
        })->toArray();
    }
}
