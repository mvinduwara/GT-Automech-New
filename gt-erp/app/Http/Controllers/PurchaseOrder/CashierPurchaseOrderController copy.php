<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashierPurchaseOrderController extends Controller
{
    /**
     * Show the form for creating a new resource.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        try {
            // Find products that are in stock and near or below their reorder level
            $suggestedProducts = Product::with(['stocks' => function ($query) {
                $query->where('quantity', '>', 0);
            }, 'unitOfMeasure'])
            ->has('stocks') // Only include products that have stock
            ->get()
            ->filter(function ($product) {
                // Filter products where total stock quantity is less than or equal to reorder level
                $totalStock = $product->stocks->sum('quantity');
                return $totalStock <= $product->reorder_level;
            })
            ->values()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'part_number' => $product->part_number,
                    'total_stock' => $product->stocks->sum('quantity'),
                    'reorder_level' => $product->reorder_level,
                    'stocks' => $product->stocks->map(function($stock) {
                        return [
                            'id' => $stock->id,
                            'quantity' => $stock->quantity,
                        ];
                    }),
                ];
            });

            Log::info('Successfully retrieved suggested products for new purchase order.');

            return Inertia::render('purchase-order/cashier/create', [
                'suggestedProducts' => $suggestedProducts,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve suggested products for purchase order creation.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Inertia::location(route('dashboard.purchase-order.index'))->with('error', 'Failed to load products for purchase order creation.');
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
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array'],
            'items.*.stock_id' => ['required', 'exists:stocks,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            Log::error("Validation failed for new purchase order.", ['errors' => $validator->errors()->toArray()]);
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed. Please check the provided data.');
        }

        try {
            DB::beginTransaction();

            // 2. Create the Purchase Order
            $purchaseOrder = new PurchaseOrder();
            $purchaseOrder->date = now();
            $purchaseOrder->status = 'pending';
            $purchaseOrder->save();
            
            // 3. Attach items
            $purchaseOrderItems = [];
            foreach ($request->items as $item) {
                $purchaseOrderItems[] = [
                    'purchase_order_id' => $purchaseOrder->id,
                    'stock_id' => $item['stock_id'],
                    'quantity' => $item['quantity'],
                    'is_approved' => 0, // Default to not approved
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $purchaseOrder->purchaseOrderItems()->insert($purchaseOrderItems);

            DB::commit();

            Log::info("Purchase Order '{$purchaseOrder->name}' created successfully.", ['purchase_order_id' => $purchaseOrder->id]);
            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase order created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create new purchase order.", [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'An error occurred while creating the purchase order.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $purchase_order_id
     * @return \Inertia\Response
     */
    public function edit(Request $request, $purchase_order_id)
    {
        try {
            $purchaseOrder = PurchaseOrder::with(['purchaseOrderItems.stock.product'])
                ->where('id', $purchase_order_id)
                ->firstOrFail();

            // Fetch all products for the suggestion list
            $allProducts = Product::with(['stocks' => function ($query) {
                $query->where('quantity', '>', 0);
            }])
            ->has('stocks')
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'part_number' => $product->part_number,
                    'total_stock' => $product->stocks->sum('quantity'),
                    'stocks' => $product->stocks->map(function($stock) {
                        return [
                            'id' => $stock->id,
                            'quantity' => $stock->quantity,
                        ];
                    }),
                ];
            });

            Log::info("Successfully retrieved purchase order {$purchase_order_id} for editing.");

            return Inertia::render('purchase-order/cashier/edit', [
                'purchaseOrder' => $purchaseOrder,
                'allProducts' => $allProducts,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to retrieve purchase order {$purchase_order_id} for editing.", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Inertia::location(route('dashboard.purchase-order.index'))->with('error', 'Purchase order not found or an error occurred.');
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $purchase_order_id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $purchase_order_id)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array'],
            'items.*.stock_id' => ['required', 'exists:stocks,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            Log::error("Validation failed for updating purchase order {$purchase_order_id}.", ['errors' => $validator->errors()->toArray()]);
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed. Please check the provided data.');
        }
    
        try {
            DB::beginTransaction();

            $purchaseOrder = PurchaseOrder::findOrFail($purchase_order_id);

            // 2. Delete existing items
            $purchaseOrder->purchaseOrderItems()->delete();

            // 3. Re-attach updated items
            $purchaseOrderItems = [];
            foreach ($request->items as $item) {
                $purchaseOrderItems[] = [
                    'purchase_order_id' => $purchaseOrder->id,
                    'stock_id' => $item['stock_id'],
                    'quantity' => $item['quantity'],
                    'is_approved' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $purchaseOrder->purchaseOrderItems()->insert($purchaseOrderItems);

            // Set status to pending again for re-checking by admin
            $purchaseOrder->status = 'pending';
            $purchaseOrder->save();

            DB::commit();

            Log::info("Purchase Order {$purchaseOrder->name} updated successfully.", ['purchase_order_id' => $purchaseOrder->id]);
            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase order updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to update purchase order {$purchase_order_id}.", [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'An error occurred while updating the purchase order.');
        }
    }
}
