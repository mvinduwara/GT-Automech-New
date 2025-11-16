<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\StockReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Inertia\Inertia;

class StockReportController extends Controller
{
    /**
     * Show the report page (Inertia view).
     */
    public function index(Request $request)
    {
        return Inertia::render('reports/stock-report');
    }

    /**
     * Generate & download the Excel file.
     */
    public function download(Request $request, StockReportService $reportService): BinaryFileResponse
    {
        try {
            Log::info('Stock report generation started.', ['user_id' => auth()->id()]);

            $spreadsheet = $reportService->generate();

            $fileName = 'StockReport_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            $filePath = storage_path('app/' . $fileName);

            $writer = new Xlsx($spreadsheet);
            $writer->save($filePath);

            Log::info('Stock report generated successfully.', [
                'file' => $fileName,
                'user_id' => auth()->id(),
            ]);

            return response()->download($filePath, $fileName)->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::error('Stock report generation failed.', [
                'user_id' => auth()->id(),
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            abort(500, 'Could not generate report.');
        }
    }

    public function getFilters(Request $request)
    {
        return response()->json([
            'categories' => Category::where('status', 'active')
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'brands' => Brand::where('status', 'active')
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'products' => Product::where('status', 'active')
                ->with(['category:id,name', 'brand:id,name'])
                ->select('id', 'name', 'part_number', 'category_id', 'brand_id')
                ->orderBy('name')
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'part_number' => $p->part_number,
                    'category_id' => $p->category_id,
                    'brand_id' => $p->brand_id,
                ]),
        ]);
    }

    /**
     * Generate & download filtered PDF report
     */
    public function downloadFiltered(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|string',
            'brand_id' => 'nullable|string',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|exists:products,id',
        ]);

        // Safely get values with null coalescing
        $categoryId = $validated['category_id'] ?? null;
        $brandId = $validated['brand_id'] ?? null;
        $productIds = $validated['product_ids'] ?? [];

        // Normalize 'all' to null
        if ($categoryId === 'all') $categoryId = null;
        if ($brandId === 'all') $brandId = null;

        // Ensure at least one filter is provided
        if (empty($categoryId) && empty($brandId) && empty($productIds)) {
            return response()->json([
                'error' => 'At least one filter must be selected (category, brand, or products).'
            ], 422);
        }
        // Ensure at least one filter is provided
        if (
            empty($categoryId) &&
            empty($brandId) &&
            empty($validated['product_ids'])
        ) {
            return response()->json([
                'error' => 'At least one filter must be selected (category, brand, or products).'
            ], 422);
        }

        try {
            Log::info('Filtered stock report generation started.', [
                'user_id' => auth()->id(),
                'filters' => $validated,
            ]);

            // Build query based on filters
            $query = Product::with(['category', 'brand', 'unitOfMeasure', 'stocks'])
                ->whereHas('stocks', fn($q) => $q->where('status', 'active'));

            // Category filter
            if (!empty($categoryId)) {
                $query->where('category_id', (int)$categoryId);
            }

            // Brand filter
            if (!empty($brandId)) {
                $query->where('brand_id', (int)$brandId);
            }

            // Product filter
            if (!empty($validated['product_ids'])) {
                $query->whereIn('id', $validated['product_ids']);
            }

            $products = $query->get();

            // Check if any products found
            if ($products->isEmpty()) {
                return response()->json([
                    'error' => 'No products found matching the selected filters.'
                ], 404);
            }

            // Get filter names for display
            $filterInfo = [];

            if (!empty($categoryId)) {
                $category = Category::find($categoryId);
                $filterInfo['category'] = $category?->name ?? 'Unknown Category';
            } else {
                $filterInfo['category'] = 'All Categories';
            }

            if (!empty($brandId)) {
                $brand = Brand::find($brandId);
                $filterInfo['brand'] = $brand?->name ?? 'Unknown Brand';
            } else {
                $filterInfo['brand'] = 'All Brands';
            }

            if (!empty($productIds)) {
                $filterInfo['product_count'] = count($productIds);
            }
            // Prepare data for PDF
            $reportData = $products->map(function ($product) {
                $stocks = $product->stocks()->where('status', 'active')->get();
                $qty = $stocks->sum('quantity');
                $avgBuy = $stocks->avg('buying_price') ?? 0;
                $avgSell = $stocks->avg('selling_price') ?? 0;

                return [
                    'id' => $product->id,
                    'part_number' => $product->part_number,
                    'name' => $product->name,
                    'description' => strip_tags($product->description),
                    'category' => $product->category->name ?? '-',
                    'brand' => $product->brand->name ?? '-',
                    'uom' => $product->unitOfMeasure->abbreviation ?? '-',
                    'reorder_level' => $product->reorder_level,
                    'current_stock' => $qty,
                    'avg_buying_price' => $avgBuy,
                    'avg_selling_price' => $avgSell,
                    'inventory_value' => $qty * $avgBuy,
                    'sales_value' => $qty * $avgSell,
                    'is_low_stock' => $product->is_low_stock,
                ];
            });

            // Calculate totals
            $totals = [
                'total_stock' => $reportData->sum('current_stock'),
                'total_inventory_value' => $reportData->sum('inventory_value'),
                'total_sales_value' => $reportData->sum('sales_value'),
            ];

            $pdf = Pdf::loadView('reports.filtered-stock-report', [
                'products' => $reportData,
                'filterInfo' => $filterInfo,
                'totals' => $totals,
                'generatedAt' => now()->format('Y-m-d H:i:s'),
                'generatedBy' => auth()->user()->name ?? 'System',
            ])->setPaper('a4', 'landscape');

            $fileName = 'StockReport_' . now()->format('Y-m-d_H-i-s') . '.pdf';

            Log::info('Filtered stock report generated successfully.', [
                'file' => $fileName,
                'user_id' => auth()->id(),
                'count' => $products->count(),
            ]);

            return $pdf->download($fileName);
        } catch (\Throwable $e) {
            Log::error('Filtered stock report generation failed.', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Could not generate filtered report.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
