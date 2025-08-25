<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SelectionController extends Controller
{
    /**
     * Get the category ID for a given category name.
     */
    private function getCategoryId(string $categoryName): ?int
    {
        try {
            $category = Category::where('name', $categoryName)->first();
            if (!$category) {
                Log::warning('Category not found', ['category_name' => $categoryName]);
            }
            return $category->id ?? null;
        } catch (\Throwable $e) {
            Log::error('Failed to find category ID', ['category_name' => $categoryName, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Oil brands (distinct brands that have at least one oil product).
     */
    public function oilBrands(): JsonResponse
    {
        Log::info("searching oilBrands");
        $categoryId = $this->getCategoryId('Oil, Engine');

        if (!$categoryId) {
            return response()->json(['message' => 'Unable to load oil brands. Category "Oils" not found.'], 500);
        }

        try {
            $brands = Brand::whereHas('products', fn($q) => $q->where('category_id', $categoryId))
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

        $categoryId = $this->getCategoryId('Filter, Oil');
        
        if (!$categoryId) {
            return response()->json(['message' => 'Unable to load oils. Category "Oils" not found.'], 500);
        }

        try {
            $oils = Product::where('category_id', $categoryId)
                ->where('brand_id', $request->brand_id)
                ->select('id', 'name', 'description', 'stocks.selling_price')
                ->orderBy('name')
                ->get();

            Log::info('Oils fetched', ['oils' => $oils,'brand_id' => $request->brand_id, 'count' => $oils->count()]);
            
            // Map the collection to include the accessor attributes
            $oils->map(function ($oil) {
                $oil->price = $oil->price;
                return $oil;
            });

            return response()->json(['data' => $oils]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oils', ['brand_id' => $request->brand_id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load oils'], 500);
        }
    }

    /**
     * Oil filters.
     */
    public function oilFilters(): JsonResponse
    {
        $categoryId = $this->getCategoryId('Filter, Oil');

        if (!$categoryId) {
            return response()->json(['message' => 'Unable to load oil filters. Category "Oil Filters" not found.'], 500);
        }

        try {
            $filters = Product::where('category_id', $categoryId)
                ->select('id', 'name', 'description')
                ->orderBy('name')
                ->get();

            Log::info('Oil filters fetched', ['count' => $filters->count()]);

            // Map the collection to include the accessor attributes
            $filters->map(function ($filter) {
                $filter->price = $filter->price;
                $filter->vehicle_compatibility = $filter->description;
                return $filter;
            });

            return response()->json(['data' => $filters]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oil filters', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load oil filters'], 500);
        }
    }

    /**
     * Drain plug seals.
     */
    public function drainPlugSeals(): JsonResponse
    {
        $categoryId = $this->getCategoryId('Drain Plug Seals');

        if (!$categoryId) {
            return response()->json(['message' => 'Unable to load drain plug seals. Category "Drain Plug Seals" not found.'], 500);
        }

        try {
            $seals = Product::where('category_id', $categoryId)
                ->select('id', 'name', 'description')
                ->orderBy('name')
                ->get();

            Log::info('Drain plug seals fetched', ['count' => $seals->count()]);
            
            // Map the collection to include the accessor attributes
            $seals->map(function ($seal) {
                $seal->price = $seal->price;
                $seal->vehicle_compatibility = $seal->description;
                return $seal;
            });

            return response()->json(['data' => $seals]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch drain plug seals', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to load drain plug seals'], 500);
        }
    }
}
