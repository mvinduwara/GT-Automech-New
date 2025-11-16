<?php

namespace App\Services;

use App\Models\PurchaseOrder; // Use your PurchaseOrder model
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class PurchaseOrderReportService
{
    public function generate(array $filters = []): Spreadsheet
    {
        $query = PurchaseOrder::query();

        // Optional filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $orders = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $sheet->setCellValue('A1', 'PO ID');
        $sheet->setCellValue('B1', 'Supplier');
        $sheet->setCellValue('C1', 'Date');
        $sheet->setCellValue('D1', 'Total Amount');
        $sheet->setCellValue('E1', 'Status');

        $row = 2;
        foreach ($orders as $order) {
            $sheet->setCellValue('A' . $row, $order->id);
            $sheet->setCellValue('B' . $row, $order->supplier->name ?? '');
            $sheet->setCellValue('C' . $row, $order->date);
            $sheet->setCellValue('D' . $row, $order->total_amount);
            $sheet->setCellValue('E' . $row, $order->status);
            $row++;
        }

        // Format total amount as currency
        $sheet->getStyle('D2:D' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);

        return $spreadsheet;
    }
}
