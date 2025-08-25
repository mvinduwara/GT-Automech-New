<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Stock;
use App\Models\VehicleService;
use App\Models\VehicleServiceOption;
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
            Log::info('Searching for category', ['category_name' => $categoryName]);

            $category = Category::where('name', $categoryName)->first();

            if (!$category) {
                Log::warning('Category not found', ['category_name' => $categoryName]);

                // Log all available categories for debugging
                $allCategories = Category::select('id', 'name', 'status')->get();
                Log::info('Available categories', ['categories' => $allCategories->toArray()]);

                return null;
            }

            Log::info('Category found', ['category' => $category->toArray()]);
            return $category->id;
        } catch (\Throwable $e) {
            Log::error('Failed to find category ID', [
                'category_name' => $categoryName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Oil brands (distinct brands that have at least one oil product).
     */
    public function oilBrands(): JsonResponse
    {
        Log::info("=== Starting oilBrands search ===");

        $categoryId = $this->getCategoryId('Oil, Engine');

        if (!$categoryId) {
            Log::error('Oil brands search failed: Category not found');
            return response()->json(['message' => 'Unable to load oil brands. Category "Oil, Engine" not found.'], 500);
        }

        try {
            // First, let's check if there are any products in this category
            $productsInCategory = Product::where('category_id', $categoryId)->count();
            Log::info('Products in Oil, Engine category', ['count' => $productsInCategory]);

            // Check if any of those products have stocks
            $productsWithStocks = Product::where('category_id', $categoryId)
                ->whereHas('stocks')
                ->count();
            Log::info('Products with stocks in Oil, Engine category', ['count' => $productsWithStocks]);

            // Check brands that have products in this category
            $brandsWithProducts = Brand::whereHas('products', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })->count();
            Log::info('Brands with products in Oil, Engine category', ['count' => $brandsWithProducts]);

            // Main query with detailed logging
            $brands = Brand::whereHas('products.stocks')
                ->whereHas('products', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                })
                ->select('id', 'name')
                ->orderBy('name')
                ->get();

            Log::info('Final oil brands query result', [
                'count' => $brands->count(),
                'brands' => $brands->toArray()
            ]);

            // If still empty, let's check what brands exist at all
            if ($brands->isEmpty()) {
                $allBrands = Brand::select('id', 'name')->get();
                Log::info('All available brands', ['brands' => $allBrands->toArray()]);
            }

            return response()->json(['data' => $brands]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oil brands', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Unable to load oil brands'], 500);
        }
    }

    /**
     * Oils by brand.
     */
    public function oils(Request $request): JsonResponse
    {
        Log::info("=== Starting oils search ===", ['brand_id' => $request->brand_id]);

        $request->validate(['brand_id' => 'required|integer|exists:brands,id']);

        // NOTE: This looks wrong - you're searching for "Filter, Oil" but the method is called oils()
        // Should this be "Oil, Engine" instead?
        $categoryId = $this->getCategoryId('Filter, Oil');

        if (!$categoryId) {
            Log::error('Oils search failed: Category not found');
            return response()->json(['message' => 'Unable to load oils. Category "Filter, Oil" not found.'], 500);
        }

        try {
            // Verify the brand exists and log its details
            $brand = Brand::find($request->brand_id);
            Log::info('Brand details', ['brand' => $brand ? $brand->toArray() : 'not found']);

            // Check products by this brand in this category
            $productsCount = Product::where('brand_id', $request->brand_id)
                ->where('category_id', $categoryId)
                ->count();
            Log::info('Products by brand in category', ['count' => $productsCount]);

            // Check stocks for these products
            $stocksCount = Stock::whereHas('product', function ($q) use ($request, $categoryId) {
                $q->where('brand_id', $request->brand_id)
                    ->where('category_id', $categoryId);
            })->where('status', 'active')->count();
            Log::info('Active stocks for brand products in category', ['count' => $stocksCount]);

            $oils = Stock::with(['product' => fn($q) => $q->with(['brand', 'category'])])
                ->whereHas('product', function ($q) use ($categoryId, $request) {
                    $q->where('category_id', $categoryId)
                        ->where('brand_id', $request->brand_id);
                })
                ->where('status', 'active')
                ->get();

            Log::info('Raw stocks query result', [
                'count' => $oils->count(),
                'stocks' => $oils->map(function ($stock) {
                    return [
                        'stock_id' => $stock->id,
                        'product_id' => $stock->product_id,
                        'product_name' => $stock->product->name ?? 'N/A',
                        'brand_name' => $stock->product->brand->name ?? 'N/A',
                        'category_name' => $stock->product->category->name ?? 'N/A',
                        'selling_price' => $stock->selling_price,
                        'status' => $stock->status,
                    ];
                })->toArray()
            ]);

            $transformedOils = $oils->map(function ($stock) {
                return (object) [
                    'id' => $stock->product->id,
                    'name' => $stock->product->name,
                    'description' => $stock->product->description,
                    'price' => $stock->selling_price,
                ];
            })->sortBy('name')->values();

            Log::info('Final transformed oils', [
                'count' => $transformedOils->count(),
                'oils' => $transformedOils->toArray()
            ]);

            return response()->json(['data' => $transformedOils]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oils', [
                'brand_id' => $request->brand_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Unable to load oils'], 500);
        }
    }

    /**
     * Oil filters.
     */
    public function oilFilters(): JsonResponse
    {
        Log::info("=== Starting oilFilters search ===");

        $categoryId = $this->getCategoryId('Filter, Oil');

        if (!$categoryId) {
            Log::error('Oil filters search failed: Category not found');
            return response()->json(['message' => 'Unable to load oil filters. Category "Filter, Oil" not found.'], 500);
        }

        try {
            // Check products in category
            $productsCount = Product::where('category_id', $categoryId)->count();
            Log::info('Products in Filter, Oil category', ['count' => $productsCount]);

            // Check active stocks
            $stocksCount = Stock::whereHas('product', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })->where('status', 'active')->count();
            Log::info('Active stocks in Filter, Oil category', ['count' => $stocksCount]);

            $filters = Stock::with(['product' => fn($q) => $q->with(['category'])])
                ->whereHas('product', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                })
                ->where('status', 'active')
                ->get();

            Log::info('Raw oil filters query result', [
                'count' => $filters->count(),
                'filters' => $filters->map(function ($stock) {
                    return [
                        'stock_id' => $stock->id,
                        'product_id' => $stock->product_id,
                        'product_name' => $stock->product->name ?? 'N/A',
                        'category_name' => $stock->product->category->name ?? 'N/A',
                        'selling_price' => $stock->selling_price,
                    ];
                })->toArray()
            ]);

            $transformedFilters = $filters->map(function ($stock) {
                return (object) [
                    'id' => $stock->product->id,
                    'name' => $stock->product->name,
                    'description' => $stock->product->description,
                    'price' => $stock->selling_price,
                    'vehicle_compatibility' => $stock->product->description,
                ];
            })->sortBy('name')->values();

            Log::info('Final transformed oil filters', [
                'count' => $transformedFilters->count(),
                'filters' => $transformedFilters->toArray()
            ]);

            return response()->json(['data' => $transformedFilters]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch oil filters', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Unable to load oil filters'], 500);
        }
    }

    public function drainPlugSeals(): JsonResponse
    {
        Log::info("=== Starting drainPlugSeals search ===");

        $categoryId = $this->getCategoryId('Drain Plug Seals');

        if (!$categoryId) {
            Log::error('Drain plug seals search failed: Category not found');
            return response()->json(['message' => 'Unable to load drain plug seals. Category "Drain Plug Seals" not found.'], 500);
        }

        try {
            // Check products in category
            $productsCount = Product::where('category_id', $categoryId)->count();
            Log::info('Products in Drain Plug Seals category', ['count' => $productsCount]);

            // Check active stocks
            $stocksCount = Stock::whereHas('product', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })->where('status', 'active')->count();
            Log::info('Active stocks in Drain Plug Seals category', ['count' => $stocksCount]);

            $seals = Stock::with(['product' => fn($q) => $q->with(['category'])])
                ->whereHas('product', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                })
                ->where('status', 'active')
                ->get();

            Log::info('Raw drain plug seals query result', [
                'count' => $seals->count(),
                'seals' => $seals->map(function ($stock) {
                    return [
                        'stock_id' => $stock->id,
                        'product_id' => $stock->product_id,
                        'product_name' => $stock->product->name ?? 'N/A',
                        'category_name' => $stock->product->category->name ?? 'N/A',
                        'selling_price' => $stock->selling_price,
                    ];
                })->toArray()
            ]);

            $transformedSeals = $seals->map(function ($stock) {
                return (object) [
                    'id' => $stock->product->id,
                    'name' => $stock->product->name,
                    'description' => $stock->product->description,
                    'price' => $stock->selling_price,
                    'vehicle_compatibility' => $stock->product->description,
                ];
            })->sortBy('name')->values();

            Log::info('Final transformed drain plug seals', [
                'count' => $transformedSeals->count(),
                'seals' => $transformedSeals->toArray()
            ]);

            return response()->json(['data' => $transformedSeals]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch drain plug seals', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Unable to load drain plug seals'], 500);
        }
    }

    /**
     * Debug method to check data integrity
     */
    public function debugData(): JsonResponse
    {
        try {
            $debug = [
                'categories' => Category::select('id', 'name', 'status')->get(),
                'brands' => Brand::select('id', 'name', 'status')->get(),
                'products_count' => Product::count(),
                'stocks_count' => Stock::count(),
                'active_stocks_count' => Stock::where('status', 'active')->count(),
                'products_with_stocks' => Product::whereHas('stocks')->count(),
                'sample_products' => Product::with(['category', 'brand', 'stocks'])->limit(5)->get(),
            ];

            return response()->json($debug);
        } catch (\Throwable $e) {
            Log::error('Debug data failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Debug failed'], 500);
        }
    }

    public function vehicleServices(): JsonResponse
    {
        Log::info("=== Starting vehicleServices search ===");

        try {
            // Check if we have any vehicle services at all
            $totalServicesCount = VehicleService::count();
            Log::info('Total vehicle services in database', ['count' => $totalServicesCount]);

            if ($totalServicesCount === 0) {
                Log::warning('No vehicle services found in database');
                return response()->json([
                    'data' => [],
                    'message' => 'No vehicle services available'
                ]);
            }

            // Check active vehicle services
            $activeServicesCount = VehicleService::where('status', 'active')->count();
            Log::info('Active vehicle services count', ['count' => $activeServicesCount]);

            // Check vehicle service options
            $totalOptionsCount = VehicleServiceOption::count();
            $activeOptionsCount = VehicleServiceOption::where('status', 'active')->count();
            Log::info('Vehicle service options', [
                'total_options' => $totalOptionsCount,
                'active_options' => $activeOptionsCount
            ]);

            // Main query to get services with their options
            $services = VehicleService::with(['options' => function ($query) {
                $query->where('status', 'active')
                    ->orderBy('name');
            }])
                ->where('status', 'active')
                ->orderBy('name')
                ->get();

            Log::info('Raw vehicle services query result', [
                'count' => $services->count(),
                'services_with_options' => $services->map(function ($service) {
                    return [
                        'service_id' => $service->id,
                        'service_name' => $service->name,
                        'options_count' => $service->options->count(),
                        'options' => $service->options->map(function ($option) {
                            return [
                                'option_id' => $option->id,
                                'option_name' => $option->name,
                                'price' => $option->price,
                                'status' => $option->status
                            ];
                        })->toArray()
                    ];
                })->toArray()
            ]);

            // Transform to match the interface structure
            $transformedServices = $services->map(function ($service) {
                // Calculate base price (you might want to adjust this logic)
                // For now, using the minimum option price as base price, or 0 if no options
                $basePrice = $service->options->min('price') ?? 0;

                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'base_price' => (float) $basePrice,
                    'options' => $service->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'service_id' => $option->vehicle_service_id,
                            'name' => $option->name,
                            'price' => (float) $option->price,
                        ];
                    })->values()->toArray()
                ];
            })->values();

            Log::info('Final transformed vehicle services', [
                'count' => $transformedServices->count(),
                'services' => $transformedServices->toArray()
            ]);

            // Additional validation logging
            $servicesWithoutOptions = $transformedServices->filter(function ($service) {
                return empty($service['options']);
            });

            if ($servicesWithoutOptions->count() > 0) {
                Log::warning('Services found without active options', [
                    'count' => $servicesWithoutOptions->count(),
                    'services' => $servicesWithoutOptions->pluck('name')->toArray()
                ]);
            }

            return response()->json([
                'data' => $transformedServices,
                'meta' => [
                    'total_services' => $transformedServices->count(),
                    'services_with_options' => $transformedServices->filter(function ($service) {
                        return !empty($service['options']);
                    })->count(),
                    'services_without_options' => $servicesWithoutOptions->count(),
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch vehicle services', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Unable to load vehicle services. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get vehicle service options by service ID.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function vehicleServiceOptions(Request $request): JsonResponse
    {
        Log::info("=== Starting vehicleServiceOptions search ===", [
            'service_id' => $request->service_id
        ]);

        // Validate request
        try {
            $validated = $request->validate([
                'service_id' => 'required|integer|exists:vehicle_services,id'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Vehicle service options validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Invalid service ID provided',
                'errors' => $e->errors()
            ], 422);
        }

        $serviceId = $validated['service_id'];

        try {
            // Verify the service exists and log its details
            $service = VehicleService::find($serviceId);
            if (!$service) {
                Log::warning('Vehicle service not found', ['service_id' => $serviceId]);
                return response()->json(['message' => 'Service not found'], 404);
            }

            Log::info('Vehicle service found', [
                'service' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'status' => $service->status
                ]
            ]);

            // Check if service is active
            if ($service->status !== 'active') {
                Log::warning('Attempting to get options for inactive service', [
                    'service_id' => $serviceId,
                    'status' => $service->status
                ]);

                return response()->json([
                    'message' => 'Service is not currently available',
                    'data' => []
                ]);
            }

            // Get options for this service
            $optionsCount = VehicleServiceOption::where('vehicle_service_id', $serviceId)->count();
            $activeOptionsCount = VehicleServiceOption::where('vehicle_service_id', $serviceId)
                ->where('status', 'active')
                ->count();

            Log::info('Service options count', [
                'service_id' => $serviceId,
                'total_options' => $optionsCount,
                'active_options' => $activeOptionsCount
            ]);

            $options = VehicleServiceOption::where('vehicle_service_id', $serviceId)
                ->where('status', 'active')
                ->orderBy('name')
                ->get();

            Log::info('Raw service options query result', [
                'service_id' => $serviceId,
                'count' => $options->count(),
                'options' => $options->map(function ($option) {
                    return [
                        'option_id' => $option->id,
                        'option_name' => $option->name,
                        'price' => $option->price,
                        'status' => $option->status
                    ];
                })->toArray()
            ]);

            // Transform options to match interface
            $transformedOptions = $options->map(function ($option) {
                return [
                    'id' => $option->id,
                    'service_id' => $option->vehicle_service_id,
                    'name' => $option->name,
                    'price' => (float) $option->price,
                ];
            })->values();

            Log::info('Final transformed service options', [
                'service_id' => $serviceId,
                'count' => $transformedOptions->count(),
                'options' => $transformedOptions->toArray()
            ]);

            return response()->json([
                'data' => $transformedOptions,
                'meta' => [
                    'service_id' => $serviceId,
                    'service_name' => $service->name,
                    'options_count' => $transformedOptions->count()
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch vehicle service options', [
                'service_id' => $serviceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Unable to load service options. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
