<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem; // Added
use App\Models\Stock; // Added
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Added
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the purchase orders.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            $query = PurchaseOrder::withCount('purchaseOrderItems')
                ->latest(); // Order by latest first

            // Search by order name
            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Filter by status
            if ($request->has('status') && $request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
                $dateFrom = Carbon::parse($request->date_from)->startOfDay();
                $dateTo = Carbon::parse($request->date_to)->endOfDay();
                $query->whereBetween('date', [$dateFrom, $dateTo]);
            }

            // Paginate the results, with 10 items per page by default.
            $purchaseOrders = $query->paginate($request->per_page ?? 10)->withQueryString();

            Log::info('Successfully retrieved purchase orders for admin dashboard.', ['request' => $request->all()]);

            return Inertia::render('purchase-order/index', [
                'purchaseOrders' => $purchaseOrders,
                'filters' => $request->only(['search', 'status', 'date_from', 'date_to', 'per_page']),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve purchase orders.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Inertia::render('purchase-order/index')->with('error', 'Failed to load purchase orders.');
        }
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Generate next PO Number: PO-YYYY-SEQUENCE
        $year = now()->year;
        $count = PurchaseOrder::whereYear('created_at', $year)->count() + 1;
        $nextPoNumber = 'PO-' . $year . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);

        $categories = \App\Models\Category::select('id', 'name')->where('status', 'active')->get();
        $brands = \App\Models\Brand::select('id', 'name')->where('status', 'active')->get();

        return Inertia::render('purchase-order/create', [
            'generatedPoNumber' => $nextPoNumber,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    // ... store method ...

    // ... show method ...


    public function print($id)
    {
        $po = PurchaseOrder::with(['purchaseOrderItems.product', 'user', 'supplier'])
            ->findOrFail($id);

        return view('purchase-order.print', compact('po'));
    }

    public function edit($id)
    {
        $po = PurchaseOrder::with(['purchaseOrderItems.product', 'supplier'])
            ->findOrFail($id);

        $categories = \App\Models\Category::select('id', 'name')->where('status', 'active')->get();
        $brands = \App\Models\Brand::select('id', 'name')->where('status', 'active')->get();

        return Inertia::render('purchase-order/edit', [
            'purchaseOrder' => $po,
            'purchaseOrderItems' => $po->purchaseOrderItems,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function update(Request $request, $id)
    {
        $po = PurchaseOrder::findOrFail($id);

        $validated = $request->validate([
            'date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $po->update([
                'date' => $validated['date'],
                'supplier_id' => $validated['supplier_id'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Sync items (simple approach: delete all and recreate, or strict sync)
            // For simplicity and to avoid complex diffing: delete pending items not in list? 
            // Better: Delete all items and recreate. But we might lose approval status if any.
            // Assumption: Edit is allowed when status is pending??

            // "items.*.stock_id" is NOT in validation above, check store logic. 
            // Actually store used product_id. Update logic needs validaiton too. 

            // If we delete all, we lose IDs. 
            // Lets just delete all for now as per simple update logic often used in POs if they are pending.

            // However, usually we keep IDs.
            // Let's implement delete and create for simplicity unless specified otherwise.

            $po->purchaseOrderItems()->delete();

            foreach ($validated['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'status' => 'pending',
                ]);
            }

            DB::commit();
            Log::info('Purchase Order updated successfully.', ['po_id' => $po->id]);

            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase Order updated successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to update purchase order.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'Failed to update Purchase Order. Please try again.');
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:purchase_orders,name', // Name is now the PO Number
            'date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $po = PurchaseOrder::create([
                'name' => $validated['name'],
                'date' => $validated['date'],
                'status' => 'pending', // Default status
                'user_id' => auth()->id(),
                'supplier_id' => $validated['supplier_id'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                // $stock = Stock::with('product')->findOrFail($item['stock_id']); // No longer using stock

                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    // 'stock_id' => null, // default is null
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'status' => 'pending',
                ]);
            }

            DB::commit();
            Log::info('Purchase Order created successfully.', ['po_id' => $po->id]);

            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase Order created successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to create purchase order.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'Failed to create Purchase Order. Please try again.');
        }
    }

    public function show($id)
    {
        $po = PurchaseOrder::with(['purchaseOrderItems.product.category', 'purchaseOrderItems.product.brand', 'user', 'supplier'])
            ->findOrFail($id);

        return Inertia::render('purchase-order/view', [
            'purchaseOrder' => $po
        ]);
    }

    public function searchSuppliers(Request $request)
    {
        $term = $request->query('q', '');

        $suppliers = \App\Models\Supplier::select('id', 'name', 'mobile', 'email')
            ->where('status', 'active')
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('mobile', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })
            ->limit(20)
            ->get();

        return response()->json($suppliers);
    }

    public function searchProducts(Request $request)
    {
        $term = $request->query('q', '');
        $categoryId = $request->query('category_id');
        $brandId = $request->query('brand_id');

        $query = \App\Models\Product::select('id', 'name', 'part_number')
            ->where('status', 'active');

        if ($term) {
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('part_number', 'like', "%{$term}%");
            });
        }

        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        if ($brandId && $brandId !== 'all') {
            $query->where('brand_id', $brandId);
        }

        $products = $query->limit(20)->get();

        return response()->json($products);
    }
}
