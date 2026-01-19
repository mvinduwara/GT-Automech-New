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

        return Inertia::render('purchase-order/create', [
            'generatedPoNumber' => $nextPoNumber,
        ]);
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
            'items' => 'required|array|min:1',
            'items.*.stock_id' => 'required|exists:stocks,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $po = PurchaseOrder::create([
                'name' => $validated['name'],
                'date' => $validated['date'],
                'status' => 'pending', // Default status
                'user_id' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $stock = Stock::with('product')->findOrFail($item['stock_id']);

                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'stock_id' => $stock->id,
                    'product_id' => $stock->product_id, // Redundant but good for history if stock changes
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
        $po = PurchaseOrder::with(['purchaseOrderItems.stock.product.category', 'purchaseOrderItems.stock.product.brand', 'user'])
            ->findOrFail($id);

        return Inertia::render('purchase-order/view', [
            'purchaseOrder' => $po
        ]);
    }

    public function print($id)
    {
        $po = PurchaseOrder::with(['purchaseOrderItems.stock.product', 'user']) // Removed supplier as direct relation might not exist
            ->findOrFail($id);

        return view('purchase-order.print', compact('po'));
    }
}
