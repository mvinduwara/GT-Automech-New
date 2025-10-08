<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products with filters and pagination.
     */
    public function index(Request $request)
    {
        try {
            $products = Product::query()
                ->with(['category', 'brand', 'unitOfMeasure'])
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('part_number', 'like', "%{$search}%");
                })
                ->when($request->input('category_id'), function ($query, $categoryId) {
                    $query->where('category_id', $categoryId);
                })
                ->when($request->input('brand_id'), function ($query, $brandId) {
                    $query->where('brand_id', $brandId);
                })
                ->when($request->input('status'), function ($query, $status) {
                    $query->where('status', $status);
                })
                ->when($request->input('unit_of_measure_id'), function ($query, $uomId) {
                    $query->where('unit_of_measure_id', $uomId);
                })
                ->orderBy('id', 'desc')
                ->paginate(10) // Paginate with 10 items per page
                ->withQueryString(); // Keep existing query string parameters when paginating

            $categories = Category::select('id', 'name')->where('status', 'active')->get();
            $brands = Brand::select('id', 'name')->where('status', 'active')->get();
            $unitOfMeasures = UnitOfMeasure::select('id', 'name')->where('status', 'active')->get();

            Log::info('Product index page accessed successfully.', [
                'filters' => $request->all(),
                'product_count' => $products->total()
            ]);

            return Inertia::render('inventory/product/index', [
                'products' => $products, // Pass the paginated collection
                'categories' => $categories,
                'brands' => $brands,
                'unitOfMeasures' => $unitOfMeasures,
                'filters' => $request->only(['search', 'category_id', 'brand_id', 'status', 'unit_of_measure_id']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching products for index page: ' . $e->getMessage(), ['exception' => $e]);
            return Inertia::render('inventory/product/index', [
                'products' => (object)['data' => [], 'links' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0], // Provide empty pagination structure
                'categories' => [],
                'brands' => [],
                'unitOfMeasures' => [],
                'filters' => $request->only(['search', 'category_id', 'brand_id', 'status', 'unit_of_measure_id']),
                'error' => 'Failed to load products. Please try again later.',
            ])->withViewData(['error' => 'Failed to load products.']);
        }
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        try {
            $categories = Category::select('id', 'name')->where('status', 'active')->get();
            $brands = Brand::select('id', 'name')->where('status', 'active')->get();
            $unitOfMeasures = UnitOfMeasure::select('id', 'name')->where('status', 'active')->get();

            Log::info('Product create page accessed successfully.');

            return Inertia::render('inventory/product/create', [
                'categories' => $categories,
                'brands' => $brands,
                'unitOfMeasures' => $unitOfMeasures,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading product create page: ' . $e->getMessage(), ['exception' => $e]);
            return Inertia::render('inventory/product/create', [
                'categories' => [],
                'brands' => [],
                'unitOfMeasures' => [],
                'error' => 'Failed to load product creation form. Please try again later.',
            ])->withViewData(['error' => 'Failed to load product creation form.']);
        }
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'part_number' => 'required|string|max:255|unique:products,part_number',
                'description' => 'nullable|string',
                'category_id' => [
                    'required',
                    'integer',
                    Rule::exists('categories', 'id')->where(function ($query) {
                        return $query->where('status', 'active');
                    }),
                ],
                'brand_id' => [
                    'nullable',
                    'integer',
                    Rule::exists('brands', 'id')->where(function ($query) {
                        return $query->where('status', 'active');
                    }),
                ],
                'unit_of_measure_id' => [
                    'required',
                    'integer',
                    Rule::exists('unit_of_measures', 'id')->where(function ($query) {
                        return $query->where('status', 'active');
                    }),
                ],
                'reorder_level' => 'required|integer|min:0',
                'status' => ['required', 'string', Rule::in(['active', 'deactive'])],
            ]);

            $product = Product::create($validatedData);

            Log::info('Product created successfully.', ['product_id' => $product->id, 'product_name' => $product->name]);

            return redirect()->route('dashboard.product.index')->with('success', 'Product created successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Product creation validation failed.', ['errors' => $e->errors(), 'request' => $request->all()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage(), ['exception' => $e, 'request' => $request->all()]);
            return redirect()->back()->with('error', 'Failed to create product. Please try again later.')->withInput();
        }
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        try {
            $categories = Category::select('id', 'name')->where('status', 'active')->get();
            $brands = Brand::select('id', 'name')->where('status', 'active')->get();
            $unitOfMeasures = UnitOfMeasure::select('id', 'name')->where('status', 'active')->get();

            Log::info('Product edit page accessed successfully.', ['product_id' => $product->id, 'product_name' => $product->name]);

            return Inertia::render('inventory/product/edit', [
                'product' => $product->load(['category', 'brand', 'unitOfMeasure']), // Eager load relationships for display
                'categories' => $categories,
                'brands' => $brands,
                'unitOfMeasures' => $unitOfMeasures,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading product edit page: ' . $e->getMessage(), ['exception' => $e, 'product_id' => $product->id]);
            return redirect()->route('dashboard.product.index')->with('error', 'Failed to load product for editing. Please try again later.');
        }
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'part_number' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('products', 'part_number')->ignore($product->id),
                ],
                'description' => 'nullable|string',
                'category_id' => [
                    'required',
                    'integer',
                    Rule::exists('categories', 'id')->where(function ($query) {
                        return $query->where('status', 'active');
                    }),
                ],
                'brand_id' => [
                    'nullable',
                    'integer',
                    Rule::exists('brands', 'id')->where(function ($query) {
                        return $query->where('status', 'active');
                    }),
                ],
                'unit_of_measure_id' => [
                    'required',
                    'integer',
                    Rule::exists('unit_of_measures', 'id')->where(function ($query) {
                        return $query->where('status', 'active');
                    }),
                ],
                'reorder_level' => 'required|integer|min:0',
                'status' => ['required', 'string', Rule::in(['active', 'deactive'])],
            ]);

            $product->update($validatedData);

            Log::info('Product updated successfully.', ['product_id' => $product->id, 'product_name' => $product->name]);

            return redirect()->route('dashboard.product.index')->with('success', 'Product updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Product update validation failed.', ['product_id' => $product->id, 'errors' => $e->errors(), 'request' => $request->all()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage(), ['exception' => $e, 'product_id' => $product->id, 'request' => $request->all()]);
            return redirect()->back()->with('error', 'Failed to update product. Please try again later.')->withInput();
        }
    }
}