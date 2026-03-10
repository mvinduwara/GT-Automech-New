<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['account', 'user']);

        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('reference_number', 'like', '%' . $request->search . '%');
        }

        $expenses = $query->orderBy('date', 'desc')->paginate(10)->withQueryString();
        $accounts = Account::where('type', 'expense')->get();

        return Inertia::render('expense/index', [
            'expenses' => $expenses,
            'accounts' => $accounts,
            'filters' => $request->all(['search', 'start_date', 'end_date', 'account_id', 'payment_method']),
        ]);
    }

    public function create()
    {
        $accounts = Account::where('type', 'expense')->get();
        return Inertia::render('expense/create', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'payment_method' => 'required|in:cash,cheque,bank_transfer,card',
            'reference_number' => 'nullable|string',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $validated['user_id'] = auth()->id();

        if ($request->hasFile('proof')) {
            $validated['proof_path'] = $request->file('proof')->store('expenses', 'public');
        }

        $expense = Expense::create($validated);
        $expense->syncLedgerEntry();

        return redirect()->route('dashboard.expense.index')->with('success', 'Expense recorded successfully.');
    }

    public function edit(Expense $expense)
    {
        $accounts = Account::where('type', 'expense')->get();
        return Inertia::render('expense/edit', [
            'expense' => $expense,
            'accounts' => $accounts
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'payment_method' => 'required|in:cash,cheque,bank_transfer,card',
            'reference_number' => 'nullable|string',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($request->hasFile('proof')) {
            if ($expense->proof_path) {
                Storage::disk('public')->delete($expense->proof_path);
            }
            $validated['proof_path'] = $request->file('proof')->store('expenses', 'public');
        }

        $expense->update($validated);
        $expense->syncLedgerEntry();

        return redirect()->route('dashboard.expense.index')->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        if ($expense->proof_path) {
            Storage::disk('public')->delete($expense->proof_path);
        }
        $expense->ledgerEntries()->delete();
        $expense->delete();

        return redirect()->route('dashboard.expense.index')->with('success', 'Expense deleted successfully.');
    }

    public function report(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $expenses = Expense::with('account')
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $summary = $expenses->groupBy('account_id')->map(function ($items) {
            return [
                'name' => $items->first()->account->name,
                'total' => $items->sum('amount'),
            ];
        });

        return Inertia::render('expense/reports', [
            'expenses' => $expenses,
            'summary' => $summary->values(),
            'filters' => [
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]
        ]);
    }

    public function downloadPdf(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $expenses = Expense::with('account')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        $pdf = Pdf::loadView('reports.expense-report', [
            'expenses' => $expenses,
            'startDate' => Carbon::parse($startDate)->format('d M Y'),
            'endDate' => Carbon::parse($endDate)->format('d M Y'),
            'generatedAt' => now()->format('d M Y H:i'),
            'totalAmount' => $expenses->sum('amount'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('ExpenseReport_' . $startDate . '_to_' . $endDate . '.pdf');
    }
}
