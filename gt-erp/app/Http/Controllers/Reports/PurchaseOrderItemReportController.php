<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\PurchaseOrderItemReportService;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PurchaseOrderItemReportController extends Controller
{
    public function download(PurchaseOrderItemReportService $reportService): BinaryFileResponse
    {
        $spreadsheet = $reportService->generate();
        $fileName = 'purchase_order_items_report.xlsx';

        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }
}
