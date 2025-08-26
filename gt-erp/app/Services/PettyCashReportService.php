<?php

namespace App\Services;

use App\Models\PettyCashItem;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class PettyCashReportService
{
    public function generate(array $filters = []): Spreadsheet
    {
        $query = PettyCashItem::with('voucher'); // eager load voucher

        $items = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
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


        $sheet->getStyle('E2:F' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);


        return $spreadsheet;
    }
}
