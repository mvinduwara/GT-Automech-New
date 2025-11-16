<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CashierPurchaseOrderController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Eager load product, category, and brand for each stock item.
        $stocks = Stock::with(['product.category', 'product.brand'])
            ->where('status', 'active')
            ->get();
        $categories = Category::where('status', 'active')->get();
        $brands = Brand::where('status', 'active')->get();

        return Inertia::render('purchase-order/create', [
            'stocks' => $stocks,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, $purchase_order_id)
    {
        $purchaseOrder = PurchaseOrder::with('purchaseOrderItems.stock.product.category', 'purchaseOrderItems.stock.product.brand')
            ->findOrFail($purchase_order_id);

        $stocks = Stock::with(['product.category', 'product.brand'])
            ->where('status', 'active')
            ->get();
        $categories = Category::where('status', 'active')->get();
        $brands = Brand::where('status', 'active')->get();

        return Inertia::render('purchase-order/edit', [
            'purchaseOrder' => $purchaseOrder,
            'purchaseOrderItems' => $purchaseOrder->purchaseOrderItems,
            'stocks' => $stocks,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // 1. Validate the incoming request data.
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:purchase_orders,name',
                'date' => 'required|date',
                'items' => 'required|array',
                'items.*.stock_id' => 'required|exists:stocks,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->with('error', 'Validation failed. Please check the form.');
            }
            $validated = $validator->validated();

            // 2. Start a database transaction to ensure atomicity.
            DB::beginTransaction();

            // 3. Create the purchase order first.
            $purchaseOrder = PurchaseOrder::create([
                'name' => $validated['name'],
                'date' => $validated['date'],
                'status' => 'pending', // Default status upon creation
            ]);

            // 4. Loop through the validated items and create purchase order items.
            foreach ($validated['items'] as $item) {

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'stock_id' => $item['stock_id'],
                    'quantity' => $item['quantity'],
                    'is_approved' => false,
                ]);
            }

            // 5. If everything is successful, commit the transaction and log.
            DB::commit();
            Log::info('Purchase order created successfully.', ['purchase_order_id' => $purchaseOrder->id]);

            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase order created successfully.');
        } catch (\Exception $e) {
            // 6. If any error occurs, roll back the transaction and log the error.
            DB::rollBack();
            Log::error('Failed to create purchase order.', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to create purchase order. Please try again.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $purchase_order_id)
    {
        try {
            // Eager load items to check for related GRNs
            $purchaseOrder = PurchaseOrder::with('purchaseOrderItems')->findOrFail($purchase_order_id);

            // 1. === ADD THIS CHECK ===
            // Check 1: Is the PO status no longer 'pending'?
            if ($purchaseOrder->status !== 'pending') {
                Log::warning("Attempt to update a non-pending purchase order.", ['purchase_order_id' => $purchase_order_id, 'status' => $purchaseOrder->status]);
                return back()->with('error', 'This purchase order cannot be updated because it has already been processed.');
            }

            // Check 2: Are any of its items already linked to a GRN?
            $hasGrnItems = $purchaseOrder->purchaseOrderItems()->whereHas('grnItems')->exists();
            if ($hasGrnItems) {
                Log::warning("Attempt to update a purchase order with existing GRN items.", ['purchase_order_id' => $purchase_order_id]);
                return back()->with('error', 'This purchase order cannot be updated because it is already linked to a Goods Received Note.');
            }
            // === END OF ADDED CHECK ===


            // 1. Validate the incoming request data.
            $validator = Validator::make($request->all(), [
                'date' => 'required|date',
                'items' => 'required|array',
                'items.*.stock_id' => 'required|exists:stocks,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->with('error', 'Validation failed. Please check the form.');
            }
            $validated = $validator->validated();

            // 2. Start a database transaction to ensure atomicity.
            DB::beginTransaction();

            // 3. Update the purchase order details.
            $purchaseOrder->update([
                'date' => $validated['date'],
            ]);

            // 4. Delete existing items and create new ones.
            // This is now "safe" because the checks above have ensured
            // that no GRN items are attached.
            $purchaseOrder->purchaseOrderItems()->delete();

            foreach ($validated['items'] as $item) {

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'stock_id' => $item['stock_id'],
                    'quantity' => $item['quantity'],
                    'is_approved' => false,
                ]);
            }

            // 5. If successful, commit and log.
            DB::commit();
            Log::info('Purchase order updated successfully.', ['purchase_order_id' => $purchaseOrder->id]);

            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase order updated successfully.');
        } catch (\Exception $e) {
            // 6. If any error occurs, roll back the transaction and log the error.
            DB::rollBack();
            Log::error('Failed to update purchase order.', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to update purchase order. Please try again.');
        }
    }
}
