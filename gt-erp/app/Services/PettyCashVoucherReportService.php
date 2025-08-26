<?php

namespace App\Services;

use App\Models\PettyCashVoucher;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class PettyCashVoucherReportService
{
    public function generate(array $filters = []): Spreadsheet
    {
        $query = PettyCashVoucher::with(['items', 'requestedBy', 'approvedBy']);

        // Optional filters (date, status, etc.)
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $vouchers = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Headers
        $sheet->setCellValue('A1', 'Voucher Number');
        $sheet->setCellValue('B1', 'Date');
        $sheet->setCellValue('C1', 'Status');
        $sheet->setCellValue('D1', 'Name');
        $sheet->setCellValue('E1', 'Requested By');
        $sheet->setCellValue('F1', 'Approved By');
        $sheet->setCellValue('G1', 'Description');
        $sheet->setCellValue('H1', 'Total Amount');
        $sheet->setCellValue('I1', 'Checked');

        $row = 2;
        foreach ($vouchers as $voucher) {
            $total = $voucher->items->sum(fn($item) => $item->quantity * $item->unit_price);

            $sheet->setCellValue('A' . $row, $voucher->voucher_number);
            $sheet->setCellValue('B' . $row, $voucher->date);
            $sheet->setCellValue('C' . $row, $voucher->status == 1 ? 'Approved' : 'Pending'); // optional mapping
            $sheet->setCellValue('D' . $row, $voucher->name);
            $sheet->setCellValue('E' . $row, $voucher->requestedBy?->name ?? 'N/A'); // ✅ Requested By
            $sheet->setCellValue('F' . $row, $voucher->approvedBy?->name ?? '');
            $sheet->setCellValue('G' . $row, $voucher->description);
            $sheet->setCellValue('H' . $row, $total);
            $sheet->setCellValue('I' . $row, $voucher->checked == 1 ? 'Yes' : 'No'); // ✅ Checked

            $row++;
        }


        // Format Total Amount as currency
        $sheet->getStyle('F2:F' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);

        return $spreadsheet;
    }
}
