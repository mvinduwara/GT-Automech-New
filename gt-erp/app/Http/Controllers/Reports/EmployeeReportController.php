<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\EmployeeReportService;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Log;

class EmployeeReportController extends Controller
{
    public function index()
    {
        return inertia('Reports/EmployeeReport'); // points to your React component
    }

    public function download(Request $request, EmployeeReportService $reportService): BinaryFileResponse
    {
        try {
            Log::info('Employee report generation started.', ['user_id' => auth()->id()]);

            $spreadsheet = $reportService->generate($request->query());
            $fileName = 'EmployeeReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            $tmp = tempnam(sys_get_temp_dir(), 'emp_');
            (new Xlsx($spreadsheet))->save($tmp);

            Log::info('Employee report generated.', ['file' => $fileName, 'user_id' => auth()->id()]);

            return response()
                ->download(
                    $tmp,
                    $fileName,
                    ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
                )
                ->deleteFileAfterSend(true);

        } catch (\Throwable $e) {
            Log::error('Employee report generation failed.', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Could not generate employee report.');
        }
    }
}
