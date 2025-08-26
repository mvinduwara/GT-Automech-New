<?php

namespace App\Services;

use App\Models\Supplier; // ✅ Use your Supplier model
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class SupplierReportService
{
    public function generate(array $filters = []): Spreadsheet
    {
        $query = Supplier::query();

        // Optional filters (example: status, city, etc.)
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $suppliers = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header row
        $sheet->setCellValue('A1', 'Supplier ID');
        $sheet->setCellValue('B1', 'Name');
        $sheet->setCellValue('C1', 'Email');
        $sheet->setCellValue('D1', 'Phone');
        $sheet->setCellValue('E1', 'Address');
        $sheet->setCellValue('F1', 'Status');
        $sheet->setCellValue('G1', 'Balance');

        $row = 2;
        foreach ($suppliers as $sup) {
            $sheet->setCellValue('A' . $row, $sup->id);
            $sheet->setCellValue('B' . $row, $sup->name);
            $sheet->setCellValue('C' . $row, $sup->email);
            $sheet->setCellValue('D' . $row, $sup->phone);
            $sheet->setCellValue('E' . $row, $sup->address);
            $sheet->setCellValue('F' . $row, $sup->status);
            $sheet->setCellValue('G' . $row, $sup->balance ?? 0);
            $row++;
        }

        // Format Balance column as currency
        $sheet->getStyle('G2:G' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);

        return $spreadsheet;
    }
}
