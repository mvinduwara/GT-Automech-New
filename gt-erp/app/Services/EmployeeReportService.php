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
        $sheet->setCellValue('B1', 'First Name');
        $sheet->setCellValue('C1', 'Last Name');
        $sheet->setCellValue('D1', 'Email');
        $sheet->setCellValue('E1', 'Phone');
        $sheet->setCellValue('F1', 'Department');
        $sheet->setCellValue('G1', 'Status');
        $sheet->setCellValue('H1', 'Hired Date');
        $sheet->setCellValue('I1', 'Job Title');


        $row = 2;
        foreach ($employees as $emp) {
            $sheet->setCellValue('A' . $row, $emp->id);
            $sheet->setCellValue('B' . $row, $emp->first_name); // First Name column
            $sheet->setCellValue('C' . $row, $emp->last_name);  // Last Name column
            $sheet->setCellValue('D' . $row, $emp->email);
            $sheet->setCellValue('E' . $row, $emp->mobile);     // Phone column
            $sheet->setCellValue('F' . $row, $emp->department->name ?? '');
            $sheet->setCellValue('G' . $row, $emp->status);
            $sheet->setCellValue('H' . $row, $emp->hire_date);
            $sheet->setCellValue('I' . $row, $emp->job_title);
            $row++;
        }



        // Format salary as currency
        $sheet->getStyle('G2:G' . ($row - 1))
            ->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD);

        return $spreadsheet;
    }
}
