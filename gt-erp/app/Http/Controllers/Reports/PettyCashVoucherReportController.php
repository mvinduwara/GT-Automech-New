<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\PettyCashVoucherReportService;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PettyCashVoucherReportController extends Controller
{
    public function download(PettyCashVoucherReportService $reportService): BinaryFileResponse
    {
        $spreadsheet = $reportService->generate();
        $fileName = 'petty_cash_vouchers_report.xlsx';

        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }
}
