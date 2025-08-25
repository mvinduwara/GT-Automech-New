<?php

namespace App\Services;

use App\Models\Product;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StockReportService
{
    public function generate(): Spreadsheet
    {
        $products = Product::with(['category', 'brand', 'unitOfMeasure', 'stocks'])
            ->whereHas('stocks', fn($q) => $q->where('status', 'active'))
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Stock Report');

        // Set headings
        $headings = [
            '#', 'Part Number', 'Product Name', 'Description', 'Category', 'Brand', 'UoM',
            'Reorder Level', 'Current Stock', 'Buying Price (Avg)', 'Selling Price (Avg)',
            'Inventory Value', 'Sales Value', 'Low Stock Alert'
        ];
        $sheet->fromArray($headings, null, 'A1');

        // Apply bold style to headings
        $sheet->getStyle('A1:N1')->getFont()->setBold(true);

        // Map and write data
        $row = 2;
        foreach ($products as $product) {
            $stocks = $product->stocks()->where('status', 'active')->get();
            $qty    = $stocks->sum('quantity');
            $avgBuy = $stocks->avg('buying_price') ?? 0;
            $avgSell= $stocks->avg('selling_price') ?? 0;

            $data = [
                $product->id,
                $product->part_number,
                $product->name,
                strip_tags($product->description),
                $product->category->name ?? '-',
                $product->brand->name    ?? '-',
                $product->unitOfMeasure->abbreviation ?? '-',
                $product->reorder_level,
                $qty,
                number_format($avgBuy, 2),
                number_format($avgSell, 2),
                number_format($qty * $avgBuy, 2),
                number_format($qty * $avgSell, 2),
                $product->is_low_stock ? 'YES' : 'NO',
            ];
            $sheet->fromArray($data, null, 'A' . $row);
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'N') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $spreadsheet;
    }
}