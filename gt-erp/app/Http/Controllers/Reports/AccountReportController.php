<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AccountReportController extends Controller
{
    public function index(Request $request)
    {
        $accounts = Account::orderBy('name')->get();
        
        $accountId = $request->input('account_id');
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $query = LedgerEntry::with(['transactionable', 'account'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($accountId) {
            $query->where('account_id', $accountId);
        }

        $entries = $query->orderBy('date')->get();

        return Inertia::render('accounts/report', [
            'accounts' => $accounts,
            'entries' => $entries,
            'filters' => [
                'account_id' => $accountId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
