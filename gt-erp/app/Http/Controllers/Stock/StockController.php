<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Product;
use App\Models\Category;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class StockController extends Controller
{
    /**
     * Display a listing of the stock items.
     */
    public function index(Request $request)
    {
        try {
            $query = Stock::with([
                'product.category',
                'product.unitOfMeasure',
                'alternativeProduct.category',
                'alternativeProduct.unitOfMeasure'
            ]);

            // Search by part number (main product or alternative product)
            if ($request->has('search') && $request->input('search')) {
                $searchTerm = $request->input('search');
                $query->whereHas('product', function ($q) use ($searchTerm) {
                    $q->where('part_number', 'like', '%' . $searchTerm . '%');
                })->orWhereHas('alternativeProduct', function ($q) use ($searchTerm) {
                    $q->where('part_number', 'like', '%' . $searchTerm . '%');
                });
            }

            // Filter by category
            if ($request->has('category_id') && $request->input('category_id')) {
                $query->whereHas('product', function ($q) use ($request) {
                    $q->where('category_id', $request->input('category_id'));
                });
            }

            // Filter by UOM
            if ($request->has('unit_of_measure_id') && $request->input('unit_of_measure_id')) {
                $query->whereHas('product', function ($q) use ($request) {
                    $q->where('unit_of_measure_id', $request->input('unit_of_measure_id'));
                });
            }

            // Filter by quantity range
            if ($request->has('min_qty') && $request->input('min_qty')) {
                $query->where('quantity', '>=', $request->input('min_qty'));
            }
            if ($request->has('max_qty') && $request->input('max_qty')) {
                $query->where('quantity', '<=', $request->input('max_qty'));
            }

            // Filter by buying price range
            if ($request->has('min_buying_price') && $request->input('min_buying_price')) {
                $query->where('buying_price', '>=', $request->input('min_buying_price'));
            }
            if ($request->has('max_buying_price') && $request->input('max_buying_price')) {
                $query->where('buying_price', '<=', $request->input('max_buying_price'));
            }

            // Filter by selling price range
            if ($request->has('min_selling_price') && $request->input('min_selling_price')) {
                $query->where('selling_price', '>=', $request->input('min_selling_price'));
            }
            if ($request->has('max_selling_price') && $request->input('max_selling_price')) {
                $query->where('selling_price', '<=', $request->input('max_selling_price'));
            }

            $totalStockBuyingValue = Stock::where('status', 'active')
                ->sum(DB::raw('quantity * buying_price'));

            // 8. Calculate total stock selling value
            $totalStockSellingValue = Stock::where('status', 'active')
                ->sum(DB::raw('quantity * selling_price'));

            $stocks = $query->paginate(20)->withQueryString();

            $categories = Category::select('id', 'name')->get();
            $unitOfMeasures = UnitOfMeasure::select('id', 'name', 'abbreviation')->get();

            Log::info('Stock index data fetched successfully.');

            return Inertia::render('inventory/stock/index', [
                'stocks' => $stocks,
                'filters' => $request->only(['search', 'category_id', 'unit_of_measure_id', 'min_qty', 'max_qty', 'min_buying_price', 'max_buying_price', 'min_selling_price', 'max_selling_price']),
                'categories' => $categories,
                'unitOfMeasures' => $unitOfMeasures,
                'totalStockBuyingValue' => (float) $totalStockBuyingValue,
                'totalStockSellingValue' => (float) $totalStockSellingValue,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stock index data: ' . $e->getMessage());
            return Inertia::render('inventory/stock/index', [
                'stocks' => [],
                'filters' => $request->only(['search', 'category_id', 'unit_of_measure_id', 'min_qty', 'max_qty', 'min_buying_price', 'max_buying_price', 'min_selling_price', 'max_selling_price']),
                'categories' => [],
                'unitOfMeasures' => [],
                'error' => 'Failed to load stock data. Please try again.',
            ])->with('error', 'Failed to load stock data. Please try again.');
        }
    }

    /**
     * Show the form for creating a new stock item.
     */
    public function create(Request $request)
    {
        try {
            $categories = Category::select('id', 'name')->get();
            $unitOfMeasures = UnitOfMeasure::select('id', 'name', 'abbreviation')->get();

            Log::info('Stock create form data fetched successfully.');

            return Inertia::render('inventory/stock/create', [
                'categories' => $categories,
                'unitOfMeasures' => $unitOfMeasures,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stock create form data: ' . $e->getMessage());
            return Inertia::render('inventory/stock/create', [
                'categories' => [],
                'unitOfMeasures' => [],
                'error' => 'Failed to load create form data. Please try again.',
            ])->with('error', 'Failed to load create form data. Please try again.');
        }
    }

    /**
     * Store a newly created stock item in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'alternative_product_id' => ['nullable', 'exists:products,id', Rule::notIn([$request->input('product_id')])],
                'quantity' => ['required', 'integer', 'min:0'],
                'buying_price' => ['required', 'numeric', 'min:0'],
                'selling_price' => ['required', 'numeric', 'min:0'],
                'status' => ['required', 'string', Rule::in(['active', 'deactive', 'out of stock', 'rejected'])],
            ]);

            Stock::create($validated);

            Log::info('Stock item created successfully.', ['stock_data' => $validated]);
            return redirect()->route('dashboard.stock.index')->with('success', 'Stock item created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Stock creation validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput()->with('error', 'Validation failed. Please check your inputs.');
        } catch (\Exception $e) {
            Log::error('Error creating stock item: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to create stock item. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified stock item.
     */
    public function edit(Request $request, Stock $stock)
    {
        try {
            $stock->load([
                'product.category',
                'product.unitOfMeasure',
                'alternativeProduct.category',
                'alternativeProduct.unitOfMeasure'
            ]);

            $categories = Category::select('id', 'name')->get();
            $unitOfMeasures = UnitOfMeasure::select('id', 'name', 'abbreviation')->get();

            Log::info('Stock edit form data fetched successfully for stock ID: ' . $stock->id);

            return Inertia::render('inventory/stock/edit', [
                'stock' => $stock,
                'categories' => $categories,
                'unitOfMeasures' => $unitOfMeasures,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stock edit form data for stock ID ' . ($stock->id ?? 'N/A') . ': ' . $e->getMessage());
            return redirect()->route('dashboard.stock.index')->with('error', 'Failed to load stock item for editing. Please try again.');
        }
    }

    /**
     * Update the specified stock item in storage.
     */
    public function update(Request $request, Stock $stock)
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'alternative_product_id' => ['nullable', 'exists:products,id', Rule::notIn([$request->input('product_id')])],
                'quantity' => ['required', 'integer', 'min:0'],
                'buying_price' => ['required', 'numeric', 'min:0'],
                'selling_price' => ['required', 'numeric', 'min:0'],
                'status' => ['required', 'string', Rule::in(['active', 'deactive', 'out of stock', 'rejected'])],
            ]);

            $stock->update($validated);

            Log::info('Stock item updated successfully.', ['stock_id' => $stock->id, 'updated_data' => $validated]);
            return redirect()->route('dashboard.stock.index')->with('success', 'Stock item updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Stock update validation failed for stock ID ' . ($stock->id ?? 'N/A') . ': ' . $e->getMessage(), ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput()->with('error', 'Validation failed. Please check your inputs.');
        } catch (\Exception $e) {
            Log::error('Error updating stock item for stock ID ' . ($stock->id ?? 'N/A') . ': ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to update stock item. Please try again.');
        }
    }

    /**
     * Search products for selection in create/edit forms.
     */
    public function searchProducts(Request $request)
    {
        try {
            $searchTerm = $request->input('query');
            if (empty($searchTerm)) {
                return response()->json([]);
            }

            $products = Product::where('status', 'active') // <-- Add this line
                ->where(function ($query) use ($searchTerm) { // <-- Wrap search in brackets
                    $query->where('part_number', 'like', '%' . $searchTerm . '%')
                        ->orWhere('name', 'like', '%' . $searchTerm . '%');
                })
                ->limit(10)
                ->get(['id', 'name', 'part_number', 'reorder_level']);

            Log::info('Product search performed successfully.', ['query' => $searchTerm, 'results_count' => $products->count()]);
            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error searching products: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to search products.'], 500);
        }
    }

    public function destroy(Stock $stock)
    {
        try {
            // Check if the stock item has any history
            if ($stock->hasTransactions()) {

                // 1. SOFT DELETE: Stock is in use, so deactivate it.
                $stock->status = 'deactive';
                $stock->save();

                Log::warning('Stock item soft-deleted (deactivated) due to existing history.', [
                    'stock_id' => $stock->id,
                    'product_id' => $stock->product_id
                ]);

                return redirect()->route('dashboard.stock.index')
                    ->with('info', 'Stock item was deactivated (not deleted) because it has transaction history.');
            } else {

                // 2. HARD DELETE: Stock is unused, safe to permanently delete.
                $stock->delete();

                Log::info('Stock item permanently deleted.', [
                    'stock_id' => $stock->id,
                    'product_id' => $stock->product_id
                ]);

                return redirect()->route('dashboard.stock.index')
                    ->with('success', 'Stock item permanently deleted.');
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // This will catch any final "restrict" constraint violations
            Log::error('Failed to delete stock item due to a database constraint.', [
                'stock_id' => $stock->id,
                'error_code' => $e->getCode(),
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'This stock item cannot be deleted. It may be linked to other records.');
        } catch (\Exception $e) {
            Log::error('Error deleting stock item: ' . $e->getMessage(), ['stock_id' => $stock->id]);
            return redirect()->back()->with('error', 'An error occurred while trying to delete the stock item.');
        }
    }
}
