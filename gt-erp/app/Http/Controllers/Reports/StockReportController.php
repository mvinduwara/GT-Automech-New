<?php

namespace App\Http\Controllers\Reports;

use App\Exports\StockExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StockReportController extends Controller
{
    /**
     * Show the report page (Inertia view).
     */
    public function index()
    {
        return inertia('reports/stock-report');
    }

    /**
     * Generate & download the Excel file.
     */
    public function download(Request $request): BinaryFileResponse
    {
        try {
            Log::info('Stock report generation started.', ['user_id' => auth()->id()]);

            $fileName = 'StockReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            Log::info('Stock report generated successfully.', [
                'file' => $fileName,
                'user_id' => auth()->id(),
            ]);

            return Excel::download(new StockExport, $fileName);
        } catch (\Throwable $e) {
            Log::error('Stock report generation failed.', [
                'user_id' => auth()->id(),
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            abort(500, 'Could not generate report.');
        }
    }
}