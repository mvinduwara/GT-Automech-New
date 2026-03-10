<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\JobCardProducts;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class TopSellingProductReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date') 
            ? Carbon::parse($request->input('start_date'))->startOfDay() 
            : now()->startOfDay();
            
        $endDate = $request->input('end_date') 
            ? Carbon::parse($request->input('end_date'))->endOfDay() 
            : now()->endOfDay();

        $topProducts = $this->getTopSellingData($startDate, $endDate);

        return Inertia::render('reports/top-selling-products/index', [
            'products' => $topProducts,
            'filters' => [
                'startDate' => $startDate->toDateString(),
                'endDate' => $endDate->toDateString(),
            ]
        ]);
    }

    private function getTopSellingData($startDate, $endDate)
    {
        return JobCardProducts::join('stocks', 'job_card_products.stock_id', '=', 'stocks.id')
            ->join('products', 'stocks.product_id', '=', 'products.id')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select(
                'products.id',
                'products.name',
                'products.part_number',
                'products.reorder_level',
                'brands.name as brand_name',
                DB::raw('SUM(job_card_products.quantity) as total_sold')
            )
            ->whereBetween('job_card_products.created_at', [$startDate, $endDate])
            ->groupBy('products.id', 'products.name', 'products.part_number', 'products.reorder_level', 'brands.name')
            ->orderByDesc('total_sold')
            ->get()
            ->map(function ($item) {
                // Use the model attributes for consistency
                $product = Product::find($item->id);
                $item->current_stock = $product->total_stock;
                $item->is_low_stock = $product->is_low_stock;
                return $item;
            });
    }

    public function downloadPdf(Request $request)
    {
        $startDate = $request->input('start_date') 
            ? Carbon::parse($request->input('start_date'))->startOfDay() 
            : now()->startOfDay();
            
        $endDate = $request->input('end_date') 
            ? Carbon::parse($request->input('end_date'))->endOfDay() 
            : now()->endOfDay();

        $products = $this->getTopSellingData($startDate, $endDate);

        $pdf = Pdf::loadView('reports.top-selling-products', [
            'products' => $products,
            'startDate' => $startDate->format('d M Y'),
            'endDate' => $endDate->format('d M Y'),
            'generatedAt' => now()->format('d M Y H:i'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('TopSellingProducts_' . now()->format('Ymd') . '.pdf');
    }
}
