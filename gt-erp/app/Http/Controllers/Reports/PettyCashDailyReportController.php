<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\PettyCashVoucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PettyCashDailyReportController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashVoucher::select(
            DB::raw('DATE(date) as report_date'),
            DB::raw('COUNT(*) as voucher_count'),
            DB::raw('SUM(requested_amount) as total_requested'),
            DB::raw('SUM(actual_amount) as total_spent'),
            DB::raw('SUM(balance_amount) as total_balance'),
            DB::raw('SUM(CASE WHEN finalized_at IS NOT NULL THEN 1 ELSE 0 END) as finalized_count')
        );

        if ($request->date_from) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where('date', '<=', $request->date_to);
        }

        $summaries = $query->groupBy('report_date')
            ->orderBy('report_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('reports/petty-cash-daily-index', [
            'summaries' => $summaries,
            'filters' => $request->only(['date_from', 'date_to'])
        ]);
    }

    public function show($date)
    {
        $vouchers = PettyCashVoucher::with(['requestedBy', 'approvedBy', 'items'])
            ->whereDate('date', $date)
            ->get();

        $summary = [
            'date' => $date,
            'total_requested' => $vouchers->sum('requested_amount'),
            'total_spent' => $vouchers->sum('actual_amount'),
            'total_balance' => $vouchers->sum('balance_amount'),
            'voucher_count' => $vouchers->count(),
            'finalized_count' => $vouchers->whereNotNull('finalized_at')->count(),
        ];

        return Inertia::render('reports/petty-cash-daily-show', [
            'vouchers' => $vouchers,
            'summary' => $summary
        ]);
    }

    public function exportExcel(Request $request)
    {
        $query = PettyCashVoucher::select(
            DB::raw('DATE(date) as report_date'),
            DB::raw('COUNT(*) as voucher_count'),
            DB::raw('SUM(requested_amount) as total_requested'),
            DB::raw('SUM(actual_amount) as total_spent'),
            DB::raw('SUM(balance_amount) as total_balance'),
            DB::raw('SUM(CASE WHEN finalized_at IS NOT NULL THEN 1 ELSE 0 END) as finalized_count')
        );

        if ($request->date_from) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where('date', '<=', $request->date_to);
        }

        $data = $query->groupBy('report_date')
            ->orderBy('report_date', 'desc')
            ->get();

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\PettyCashDailySummariesExport($data),
            'PettyCashDailySummaries.xlsx'
        );
    }

    public function exportDayExcel($date)
    {
        $vouchers = PettyCashVoucher::with(['requestedBy', 'approvedBy'])
            ->whereDate('date', $date)
            ->get();

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\PettyCashDayDetailsExport($vouchers, $date),
            "PettyCashDetails_{$date}.xlsx"
        );
    }

    public function downloadDailyPdf($date)
    {
        $vouchers = PettyCashVoucher::with(['requestedBy', 'approvedBy', 'items'])
            ->whereDate('date', $date)
            ->get();

        $summary = [
            'date' => $date,
            'total_requested' => $vouchers->sum('requested_amount'),
            'total_spent' => $vouchers->sum('actual_amount'),
            'total_balance' => $vouchers->sum('balance_amount'),
            'voucher_count' => $vouchers->count(),
            'finalized_count' => $vouchers->whereNotNull('finalized_at')->count(),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.petty-cash-daily-report', compact('vouchers', 'summary'));

        return $pdf->download("PettyCashDailyReport_{$date}.pdf");
    }
}
