<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\PettyCashReportService;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Log;

class PettyCashReportController extends Controller
{
    public function generate(array $filters = []): Spreadsheet
    {
        // Eager load voucher and the users
        $query = PettyCashItem::with(['voucher.requestedBy', 'voucher.approvedBy']);

        // Optional filters
        if (!empty($filters['fromDate'])) {
            $query->whereHas('voucher', function ($q) use ($filters) {
                $q->whereDate('date', '>=', $filters['fromDate']);
            });
        }

        if (!empty($filters['toDate'])) {
            $query->whereHas('voucher', function ($q) use ($filters) {
                $q->whereDate('date', '<=', $filters['toDate']);
            });
        }

        if (!empty($filters['status'])) {
            $query->whereHas('voucher', function ($q) use ($filters) {
                $q->where('status', $filters['status']);
            });
        }

        $items = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header row
        $sheet->setCellValue('A1', 'Voucher Number');
        $sheet->setCellValue('B1', 'Date');
        $sheet->setCellValue('C1', 'Item Description');
        $sheet->setCellValue('D1', 'Quantity');
        $sheet->setCellValue('E1', 'Unit Price');
        $sheet->setCellValue('F1', 'Amount');
        $sheet->setCellValue('G1', 'Status');
        $sheet->setCellValue('H1', 'Requested By');
        $sheet->setCellValue('I1', 'Approved By');

        $row = 2;

        foreach ($items as $item) {
            $voucher = $item->voucher;

            $sheet->setCellValue('A' . $row, $voucher->voucher_number ?? '');
            $sheet->setCellValue('B' . $row, $voucher->date ?? '');
            $sheet->setCellValue('C' . $row, $item->item_description);
            $sheet->setCellValue('D' . $row, $item->quantity);
            $sheet->setCellValue('E' . $row, $item->unit_price);
            $sheet->setCellValue('F' . $row, $item->amount);
            $sheet->setCellValue('G' . $row, $voucher->status ?? '');
            $sheet->setCellValue('H' . $row, $voucher->requestedBy->name ?? '');
            $sheet->setCellValue('I' . $row, $voucher->approvedBy->name ?? '');
            $row++;
        }

        // Apply number formatting
        $sheet->getStyle('E2:F' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);

        return $spreadsheet;
    }

    public function download(Request $request, PettyCashReportService $reportService): BinaryFileResponse
    {
        try {
            Log::info('Petty cash report generation started.', ['user_id' => auth()->id()]);
            $spreadsheet = $reportService->generate($request->query());
            $fileName = 'PettyCashReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            $tmp = tempnam(sys_get_temp_dir(), 'pcash_');
            (new Xlsx($spreadsheet))->save($tmp);

            Log::info('Petty cash report generated.', ['file' => $fileName, 'user_id' => auth()->id()]);

            return response()
                ->download(
                    $tmp,
                    $fileName,
                    ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
                )
                ->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::error('Petty cash report generation failed.', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Could not generate petty cash report.');
        }
    }
}
