<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\VehicleModel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProductVehicleAnalysisExport; 
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductVehicleAnalysisController extends Controller
{
    /**
     * Display the analysis page.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'vehicle_model_id', 'brand_id']);

        $query = Product::with(['brand', 'vehicleModels', 'stocks'])
            ->withCount('vehicleModels');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('vehicle_model_id')) {
            $query->whereHas('vehicleModels', function ($q) use ($request) {
                $q->where('vehicle_models.id', $request->input('vehicle_model_id'));
            });
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        $products = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('reports/product-vehicle/index', [
            'products' => $products,
            'filters' => $filters,
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'vehicleModels' => VehicleModel::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Export data to Excel.
     */
    public function exportExcel(Request $request)
    {
        try {
            Log::info('Product-Vehicle Analysis Excel export started.');

            $products = $this->getFilteredProducts($request);

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // --- Header Section ---
            $row = 1;
            
            // Title
            $sheet->setCellValue('A' . $row, 'Product-Vehicle Analysis Report');
            $sheet->mergeCells('A' . $row . ':G' . $row);
            $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $row++;

            // Generated Date
            $sheet->setCellValue('A' . $row, 'Generated On: ' . now()->format('Y-m-d H:i:s'));
            $sheet->mergeCells('A' . $row . ':G' . $row);
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $row++;

            // Filters Context
            $filters = [];
            if ($request->filled('search')) $filters[] = "Search: " . $request->input('search');
            if ($request->filled('brand_id')) {
                $brand = Brand::find($request->input('brand_id'));
                if ($brand) $filters[] = "Brand: " . $brand->name;
            }
            if ($request->filled('vehicle_model_id')) {
                $model = VehicleModel::find($request->input('vehicle_model_id'));
                if ($model) $filters[] = "Vehicle Model: " . $model->name;
            }
            
            $filterText = !empty($filters) ? "Filters: " . implode(', ', $filters) : "Filters: None";
            $sheet->setCellValue('A' . $row, $filterText);
            $sheet->mergeCells('A' . $row . ':G' . $row);
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $row++;
            $row++; // Empty line

            // --- Table Headers ---
            $headers = ['Part Number', 'Product Name', 'Brand', 'Compatible Models Count', 'Compatible Models', 'Total Stock', 'Latest Selling Price'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . $row, $header);
                $sheet->getStyle($col . $row)->getFont()->setBold(true);
                $col++;
            }
            $row++;

            foreach ($products as $product) {
                $models = $product->vehicleModels->pluck('name')->implode(', ');
                $stock = $product->stocks->where('status', 'active')->sum('quantity');
                $price = $product->stocks->sortByDesc('created_at')->first()->selling_price ?? 0;

                $sheet->setCellValue('A' . $row, $product->part_number);
                $sheet->setCellValue('B' . $row, $product->name);
                $sheet->setCellValue('C' . $row, $product->brand->name ?? '-');
                $sheet->setCellValue('D' . $row, $product->vehicle_models_count);
                $sheet->setCellValue('E' . $row, $models);
                $sheet->setCellValue('F' . $row, $stock);
                $sheet->setCellValue('G' . $row, $price);
                $row++;
            }

            // Auto-size columns
            foreach (range('A', 'G') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            $fileName = 'ProductVehicleAnalysis_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            $filePath = storage_path('app/' . $fileName);

            $writer = new Xlsx($spreadsheet);
            $writer->save($filePath);

            return response()->download($filePath, $fileName)->deleteFileAfterSend(true);

        } catch (\Throwable $e) {
            Log::error('Product-Vehicle Analysis Excel export failed.', ['error' => $e->getMessage()]);
            return back()->with('error', 'Could not export Excel.');
        }
    }

    /**
     * Export data to PDF.
     */
    public function exportPdf(Request $request)
    {
        try {
            Log::info('Product-Vehicle Analysis PDF export started.');

            $products = $this->getFilteredProducts($request);

            $data = $products->map(function ($product) {
                return [
                    'part_number' => $product->part_number,
                    'name' => $product->name,
                    'brand' => $product->brand->name ?? '-',
                    'models_count' => $product->vehicle_models_count,
                    'models' => $product->vehicleModels->pluck('name')->implode(', '),
                    'stock' => $product->stocks->where('status', 'active')->sum('quantity'),
                    'price' => $product->stocks->sortByDesc('created_at')->first()->selling_price ?? 0,
                ];
            });

            // Gather filter info for display
            $filters = [];
            if ($request->filled('search')) $filters['Search'] = $request->input('search');
            if ($request->filled('brand_id')) {
                $brand = Brand::find($request->input('brand_id'));
                if ($brand) $filters['Brand'] = $brand->name;
            }
            if ($request->filled('vehicle_model_id')) {
                $model = VehicleModel::find($request->input('vehicle_model_id'));
                if ($model) $filters['Vehicle Model'] = $model->name;
            }

            $pdf = Pdf::loadView('reports.product-vehicle-analysis', [
                'products' => $data,
                'filters' => $filters,
                'generatedAt' => now()->format('Y-m-d H:i:s'),
            ])->setPaper('a4', 'landscape');

            return $pdf->download('ProductVehicleAnalysis_' . now()->format('Y-m-d_H-i-s') . '.pdf');

        } catch (\Throwable $e) {
            Log::error('Product-Vehicle Analysis PDF export failed.', ['error' => $e->getMessage()]);
            return back()->with('error', 'Could not export PDF.');
        }
    }

    private function getFilteredProducts(Request $request)
    {
        $query = Product::with(['brand', 'vehicleModels', 'stocks'])
            ->withCount('vehicleModels');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('vehicle_model_id')) {
            $query->whereHas('vehicleModels', function ($q) use ($request) {
                $q->where('vehicle_models.id', $request->input('vehicle_model_id'));
            });
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        return $query->orderBy('name')->get();
    }
}
