<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Stock;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        // Get counts for all inventory items
        $stats = [
            'categories' => [
                'count' => Category::where('status', 'active')->count(),
                'total' => Category::count(),
                'change' => $this->calculateWeeklyChange(Category::class),
                'trend' => $this->getTrend(Category::class)
            ],
            'brands' => [
                'count' => Brand::where('status', 'active')->count(),
                'total' => Brand::count(),
                'change' => $this->calculateWeeklyChange(Brand::class),
                'trend' => $this->getTrend(Brand::class)
            ],
            'products' => [
                'count' => Product::where('status', 'active')->count(),
                'total' => Product::count(),
                'change' => $this->calculateWeeklyChange(Product::class),
                'trend' => $this->getTrend(Product::class)
            ],
            'stock' => [
                'count' => Stock::where('status', 'active')->count(),
                'total' => Stock::count(),
                'totalQuantity' => Stock::where('status', 'active')->sum('quantity'),
                'change' => $this->calculateWeeklyChange(Stock::class),
                'trend' => $this->getTrend(Stock::class)
            ]
        ];

        // Additional inventory insights
        $insights = [
            'lowStockProducts' => Product::whereHas('stocks', function ($query) {
                $query->whereRaw('quantity <= reorder_level');
            })->count(),
            'totalStockValue' => Stock::where('status', 'active')
                ->selectRaw('SUM(quantity * buying_price) as total')
                ->value('total') ?? 0,
            'topCategories' => Category::withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
                ->orderBy('products_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'products_count']),
        ];

        return Inertia::render('inventory/index', [
            'stats' => $stats,
            'insights' => $insights
        ]);
    }

    /**
     * Calculate weekly change percentage for a model
     */
    private function calculateWeeklyChange($modelClass)
    {
        $currentWeek = $modelClass::where('created_at', '>=', now()->subWeek())->count();
        $previousWeek = $modelClass::whereBetween('created_at', [
            now()->subWeeks(2),
            now()->subWeek()
        ])->count();

        if ($previousWeek == 0) {
            return $currentWeek > 0 ? '+100%' : '0%';
        }

        $change = (($currentWeek - $previousWeek) / $previousWeek) * 100;
        return ($change >= 0 ? '+' : '') . number_format($change, 1) . '%';
    }

    /**
     * Get trend direction for a model
     */
    private function getTrend($modelClass)
    {
        $currentWeek = $modelClass::where('created_at', '>=', now()->subWeek())->count();
        $previousWeek = $modelClass::whereBetween('created_at', [
            now()->subWeeks(2),
            now()->subWeek()
        ])->count();

        return $currentWeek >= $previousWeek ? 'up' : 'down';
    }
}
