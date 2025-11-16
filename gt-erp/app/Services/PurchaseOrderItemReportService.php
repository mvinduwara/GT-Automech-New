<?php

namespace App\Services;

use App\Models\PurchaseOrderItem;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class PurchaseOrderItemReportService
{
    public function generate(array $filters = []): Spreadsheet
    {
        // Eager load related purchase order and stock
        $query = PurchaseOrderItem::with(['purchaseOrder', 'stock']);

        // Optional filter example: approved items only
        if (!empty($filters['is_approved'])) {
            $query->where('is_approved', $filters['is_approved']);
        }

        $items = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header row
        $sheet->setCellValue('A1', 'Purchase Order');
        $sheet->setCellValue('B1', 'Stock');
        $sheet->setCellValue('C1', 'Quantity');
        $sheet->setCellValue('D1', 'Is Approved');

        $row = 2;
        foreach ($items as $item) {
            $sheet->setCellValue('A' . $row, $item->purchaseOrder->name ?? 'N/A');
            $sheet->setCellValue('B' . $row, $item->stocks->name ?? 'Deleted Stock');
            $sheet->setCellValue('C' . $row, $item->quantity);
            $sheet->setCellValue('D' . $row, $item->is_approved ? 'Yes' : 'No'); // Boolean mapping
            $row++;
        }

        return $spreadsheet;
    }
}
