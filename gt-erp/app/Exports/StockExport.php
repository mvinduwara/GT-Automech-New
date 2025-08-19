<?php

namespace App\Exports;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\{
    FromQuery,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithTitle,
    ShouldAutoSize
};
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StockExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    public function query()
    {
        return Product::query()
            ->with(['category', 'brand', 'unitOfMeasure', 'stocks'])
            ->whereHas('stocks', fn($q) => $q->where('status', 'active'));
    }

    public function headings(): array
    {
        return [
            '#',
            'Part Number',
            'Product Name',
            'Description',
            'Category',
            'Brand',
            'UoM',
            'Reorder Level',
            'Current Stock',
            'Buying Price (Avg)',
            'Selling Price (Avg)',
            'Inventory Value',
            'Sales Value',
            'Low Stock Alert'
        ];
    }

    public function map($product): array
    {
        $stocks = $product->stocks()->where('status', 'active')->get();
        $qty    = $stocks->sum('quantity');
        $avgBuy = $stocks->avg('buying_price') ?? 0;
        $avgSell= $stocks->avg('selling_price') ?? 0;

        return [
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
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Stock Report';
    }
}