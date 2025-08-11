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
                // Ensure the stock exists and has enough quantity
                $stock = Stock::findOrFail($item['stock_id']);
                if ($item['quantity'] > $stock->quantity) {
                    DB::rollBack();
                    Log::error('Insufficient stock quantity.', ['stock_id' => $stock->id, 'requested_quantity' => $item['quantity'], 'available_quantity' => $stock->quantity]);
                    return back()->with('error', "Insufficient stock quantity for product '{$stock->product->name}'.");
                }
                
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

            return redirect()->route('dashboard.purchase-order.cashier.index')->with('success', 'Purchase order created successfully.');
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
            $purchaseOrder = PurchaseOrder::findOrFail($purchase_order_id);

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
            $purchaseOrder->purchaseOrderItems()->delete();

            foreach ($validated['items'] as $item) {
                // Ensure the stock exists and has enough quantity
                $stock = Stock::findOrFail($item['stock_id']);
                if ($item['quantity'] > $stock->quantity) {
                    DB::rollBack();
                    Log::error('Insufficient stock quantity.', ['stock_id' => $stock->id, 'requested_quantity' => $item['quantity'], 'available_quantity' => $stock->quantity]);
                    return back()->with('error', "Insufficient stock quantity for product '{$stock->product->name}'.");
                }

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

            return redirect()->route('dashboard.purchase-order.cashier.index')->with('success', 'Purchase order updated successfully.');
        } catch (\Exception $e) {
            // 6. If any error occurs, roll back the transaction and log the error.
            DB::rollBack();
            Log::error('Failed to update purchase order.', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to update purchase order. Please try again.');
        }
    }
}
