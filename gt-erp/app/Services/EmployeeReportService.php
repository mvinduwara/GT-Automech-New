<?php

namespace App\Services;

use App\Models\Employee; // <-- adjust if your model is different
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class EmployeeReportService
{
    public function generate(array $filters = []): Spreadsheet
    {
        $query = Employee::query();

        // Optional filters (example: department, status)
        if (!empty($filters['department'])) {
            $query->where('department', $filters['department']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $employees = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $sheet->setCellValue('A1', 'Employee ID');
        $sheet->setCellValue('B1', 'Name');
        $sheet->setCellValue('C1', 'Email');
        $sheet->setCellValue('D1', 'Phone');
        $sheet->setCellValue('E1', 'Department');
        $sheet->setCellValue('F1', 'Status');
        $sheet->setCellValue('G1', 'Salary');

        $row = 2;
        foreach ($employees as $emp) {
            $sheet->setCellValue('A' . $row, $emp->id);
            $sheet->setCellValue('B' . $row, $emp->name);
            $sheet->setCellValue('C' . $row, $emp->email);
            $sheet->setCellValue('D' . $row, $emp->phone);
            $sheet->setCellValue('E' . $row, $emp->department->name ?? ''); // ✅ FIXED
            $sheet->setCellValue('F' . $row, $emp->status);
            $sheet->setCellValue('G' . $row, $emp->salary);
            $row++;
        }


        // Format salary as currency
        $sheet->getStyle('G2:G' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);

        return $spreadsheet;
    }
}
