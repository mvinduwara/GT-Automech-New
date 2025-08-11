<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
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
}
