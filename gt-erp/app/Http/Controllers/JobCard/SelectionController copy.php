<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SelectionController extends Controller
{
    /**
     * Oil brands (distinct brands that have at least one oil product).
     */
    public function oilBrands(): JsonResponse
    {
        Log::info("searching oilBrands");
        try {
            $brands = Brand::whereHas('products', fn($q) => $q->where('category_id', 1)) // 1 = oil
                ->select('id', 'name')
                ->orderBy('name')
                ->get();

            Log::info('Oil brands fetched', ['count' => $brands->count()]);

            return response()->json(['data' => $brands]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oil brands', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load oil brands'], 500);
        }
    }

    /**
     * Oils by brand.
     */
    public function oils(Request $request): JsonResponse
    {
        $request->validate(['brand_id' => 'required|integer|exists:brands,id']);

        try {
            $oils = Product::where('category_id', 1)
                ->where('brand_id', $request->brand_id)
                ->select('id', 'name', 'selling_price as price')
                ->orderBy('name')
                ->get();

            Log::info('Oils fetched', ['brand_id' => $request->brand_id, 'count' => $oils->count()]);

            return response()->json(['data' => $oils]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oils', ['brand_id' => $request->brand_id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load oils'], 500);
        }
    }

    /**
     * Oil filters (category_id = 2 is assumed for filters).
     */
    public function oilFilters(): JsonResponse
    {
        try {
            $filters = Product::where('category_id', 2)
                ->select('id', 'name', 'selling_price as price', 'description as vehicle_compatibility')
                ->orderBy('name')
                ->get();

            Log::info('Oil filters fetched', ['count' => $filters->count()]);

            return response()->json(['data' => $filters]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oil filters', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load oil filters'], 500);
        }
    }

    /**
     * Drain plug seals (category_id = 3 is assumed for seals).
     */
    public function drainPlugSeals(): JsonResponse
    {
        try {
            $seals = Product::where('category_id', 3)
                ->select('id', 'name', 'selling_price as price', 'description as vehicle_compatibility')
                ->orderBy('name')
                ->get();

            Log::info('Drain plug seals fetched', ['count' => $seals->count()]);

            return response()->json(['data' => $seals]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch drain plug seals', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load drain plug seals'], 500);
        }
    }
}
