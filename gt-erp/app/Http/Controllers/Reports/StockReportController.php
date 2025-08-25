<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\StockReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Inertia\Inertia;

class StockReportController extends Controller
{
    /**
     * Show the report page (Inertia view).
     */
    public function index(Request $request)
    {
        return Inertia::render('reports/stock-report');
    }

    /**
     * Generate & download the Excel file.
     */
    public function download(Request $request, StockReportService $reportService): BinaryFileResponse
    {
        try {
            Log::info('Stock report generation started.', ['user_id' => auth()->id()]);

            $spreadsheet = $reportService->generate();

            $fileName = 'StockReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            $filePath = storage_path('app/' . $fileName);

            $writer = new Xlsx($spreadsheet);
            $writer->save($filePath);

            Log::info('Stock report generated successfully.', [
                'file' => $fileName,
                'user_id' => auth()->id(),
            ]);

            return response()->download($filePath, $fileName)->deleteFileAfterSend(true);

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