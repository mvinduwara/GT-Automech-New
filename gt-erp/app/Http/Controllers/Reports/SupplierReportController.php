<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\SupplierReportService;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Log;

class SupplierReportController extends Controller
{
    public function index()
    {
        return inertia('Reports/SupplierReport'); // points to your React component
    }

    public function download(Request $request, SupplierReportService $reportService): BinaryFileResponse
    {
        try {
            Log::info('Supplier report generation started.', ['user_id' => auth()->id()]);

            $spreadsheet = $reportService->generate($request->query());
            $fileName = 'SupplierReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            $tmp = tempnam(sys_get_temp_dir(), 'sup_');
            (new Xlsx($spreadsheet))->save($tmp);

            Log::info('Supplier report generated.', ['file' => $fileName, 'user_id' => auth()->id()]);

            return response()
                ->download(
                    $tmp,
                    $fileName,
                    ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
                )
                ->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::error('Supplier report generation failed.', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Could not generate supplier report.');
        }
    }
}
