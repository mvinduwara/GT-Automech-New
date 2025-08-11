<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminPurchaseOrderController extends Controller
{
   
    /**
     * Display the specified purchase order with its items.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $purchaseOrder_id
     * @return \Inertia\Response
     */
    public function view(Request $request, $purchaseOrder_id)
    {
        try {
            $purchaseOrder = PurchaseOrder::with(['purchaseOrderItems.stock.product'])
                ->where('id', $purchaseOrder_id)
                ->firstOrFail();

            Log::info("Successfully retrieved purchase order {$purchaseOrder_id} for viewing.", ['purchase_order' => $purchaseOrder]);

            return Inertia::render('purchase-order/view', [
                'purchaseOrder' => $purchaseOrder,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to retrieve purchase order {$purchaseOrder_id}.", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Inertia::location(route('dashboard.purchase-order.index'))->with('error', 'Purchase order not found.');
        }
    }

    /**
     * Update the specified purchase order's status and its items' approval status.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $purchaseOrder_id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $purchaseOrder_id)
    {
        // 1. Validate the incoming request data.
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:purchase_order_items,id'],
            'items.*.is_approved' => ['required', 'boolean'],
        ]);

        if ($validator->fails()) {
            Log::error("Validation failed for purchase order update.", ['errors' => $validator->errors()->toArray()]);
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed. Please check the provided data.');
        }

        try {
            DB::beginTransaction();

            // 2. Find the purchase order.
            $purchaseOrder = PurchaseOrder::findOrFail($purchaseOrder_id);

            // 3. Update the approval status for each item.
            foreach ($request->items as $itemData) {
                $item = PurchaseOrderItem::findOrFail($itemData['id']);
                $item->is_approved = $itemData['is_approved'];
                $item->save();
            }

            // 4. Change the purchase order status to 'checked'.
            $purchaseOrder->status = 'checked';
            $purchaseOrder->save();

            DB::commit();

            Log::info("Successfully updated purchase order {$purchaseOrder_id} and its items.", ['purchase_order_id' => $purchaseOrder_id, 'new_status' => 'checked']);
            return redirect()->route('dashboard.purchase-order.index')->with('success', 'Purchase order has been successfully checked.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to update purchase order {$purchaseOrder_id}.", [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'An error occurred while updating the purchase order.');
        }
    }
}
