<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\PurchaseOrderReportService;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Log;

class PurchaseOrderReportController extends Controller
{
    public function index()
    {
        return inertia('Reports/PurchaseOrderReport'); // points to your React component
    }

    public function download(Request $request, PurchaseOrderReportService $reportService): BinaryFileResponse
    {
        try {
            Log::info('Purchase Order report generation started.', ['user_id' => auth()->id()]);

            $spreadsheet = $reportService->generate($request->query());
            $fileName = 'PurchaseOrderReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            $tmp = tempnam(sys_get_temp_dir(), 'po_');
            (new Xlsx($spreadsheet))->save($tmp);

            Log::info('Purchase Order report generated.', ['file' => $fileName, 'user_id' => auth()->id()]);

            return response()
                ->download(
                    $tmp,
                    $fileName,
                    ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
                )
                ->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::error('Purchase Order report generation failed.', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Could not generate purchase order report.');
        }
    }
}
