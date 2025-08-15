<?php

namespace App\Http\Controllers\GRN;

use App\Http\Controllers\Controller;
use App\Models\Grn;
use App\Models\GrnItem;
use App\Models\GrnLedger;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GrnController extends Controller
{
    /* ---------- INDEX ---------- */
    public function index(Request $request)
    {
        Log::info('GRN index accessed', ['user_id' => auth()->id(), 'filters' => $request->all()]);

        $query = Grn::with(['supplier', 'purchaseOrder', 'grnItems']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('grn_no', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn($s) => $s->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('purchaseOrder', fn($po) => $po->where('name', 'like', "%{$search}%"))
                    ->orWhereRelation('grnItems', 'total_price', 'like', "%{$search}%");
            });
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($start = $request->input('start')) {
            $query->whereDate('date', '>=', $start);
        }
        if ($end = $request->input('end')) {
            $query->whereDate('date', '<=', $end);
        }

        $grns = $query->latest()->get()->map(fn($g) => [
            'id' => $g->id,
            'grn_no' => $g->grn_no,
            'supplier' => $g->supplier->name,
            'po' => $g->purchaseOrder->name,
            'status' => $g->status,
            'total' => $g->grnItems->sum('total_price'),
            'date' => $g->date,
        ]);

        return Inertia::render('grn/index', [
            'grns' => $grns,
            'filters' => $request->only(['search', 'status', 'start', 'end']),
        ]);
    }

    /* ---------- CREATE ---------- */
    public function create($purchaseOrderId)
    {
        Log::info('GRN create page opened', ['purchase_order_id' => $purchaseOrderId]);
        $po = PurchaseOrder::with('purchaseOrderItems.stock.product')
            ->findOrFail($purchaseOrderId);

        return Inertia::render('grn/create', ['purchaseOrder' => $po]);
    }

    /* ---------- STORE ---------- */
    public function store(Request $request)
    {
        Log::info('GRN store attempt', $request->all());
        $validated = $request->validate([
            'grn_no'             => 'required|string|unique:grns,grn_no',
            'supplier_id'        => 'required|exists:suppliers,id',
            'purchase_order_id'  => 'required|exists:purchase_orders,id',
            'date'               => 'required|date',
            'remarks'            => 'nullable|string|max:1000',
            'items'              => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity'   => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0.01',
            'items.*.remarks'    => 'nullable|string|max:255',
        ], [
            'grn_no.unique'      => 'GRN number already exists.',
            'items.min'          => 'At least one item is required.',
            'items.*.quantity'   => 'Each item must have a valid quantity.',
            'items.*.unit_price' => 'Each item must have a valid unit price.',
        ]);

        DB::beginTransaction();
        try {
            $grn = Grn::create([
                'grn_no'            => $validated['grn_no'],
                'supplier_id'       => $validated['supplier_id'],
                'purchase_order_id' => $validated['purchase_order_id'],
                'user_id'           => auth()->id(),
                'date'              => $validated['date'],
                'remarks'           => $validated['remarks'] ?? null,
                'status'            => 'pending',
            ]);

            $total = 0;
            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                GrnItem::create([
                    'grn_id'                 => $grn->id,
                    'purchase_order_item_id' => $item['purchase_order_item_id'],
                    'quantity'               => $item['quantity'],
                    'unit_price'             => $item['unit_price'],
                    'total_price'            => $lineTotal,
                    'remarks'                => $item['remarks'] ?? null,
                ]);
                $total += $lineTotal;
            }

            GrnLedger::create([
                'grn_id' => $grn->id,
                'date'   => $grn->date,
                'debit'  => 0,
                'credit' => $total,
                'amount' => $total,
                'remarks' => 'GRN entry',
            ]);

            DB::commit();
            Log::info('GRN stored successfully', ['grn_id' => $grn->id]);
            return redirect()->route('dashboard.grn.index')
                ->with('success', 'GRN created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('GRN store error', ['exception' => $e->getMessage()]);
            return back()->withInput()->with('error', 'Could not create GRN. Try again.');
        }
    }

    /* ---------- EDIT ---------- */
    public function edit($grnId)
    {
        Log::info('GRN edit page opened', ['grn_id' => $grnId]);
        $grn = Grn::with(['grnItems', 'purchaseOrder.purchaseOrderItems'])
            ->findOrFail($grnId);

        return Inertia::render('grn/edit', ['grn' => $grn]);
    }

    /* ---------- UPDATE ---------- */
    public function update(Request $request, $grnId)
    {
        $grn = Grn::findOrFail($grnId);
        Log::info('GRN update attempt', ['grn_id' => $grnId, 'payload' => $request->all()]);

        $validated = $request->validate([
            'grn_no'            => 'required|string|unique:grns,grn_no,' . $grn->id,
            'supplier_id'       => 'required|exists:suppliers,id',
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'date'              => 'required|date',
            'remarks'           => 'nullable|string|max:1000',
            'status'            => 'required|in:pending,complete',
            'items'             => 'required|array|min:1',
            'items.*.id'        => 'sometimes|exists:grn_items,id',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity'  => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0.01',
            'items.*.remarks'   => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $grn->update([
                'grn_no'            => $validated['grn_no'],
                'supplier_id'       => $validated['supplier_id'],
                'purchase_order_id' => $validated['purchase_order_id'],
                'date'              => $validated['date'],
                'remarks'           => $validated['remarks'] ?? null,
                'status'            => $validated['status'],
            ]);

            $incomingIds = collect($validated['items'])->pluck('id')->filter()->toArray();
            GrnItem::where('grn_id', $grn->id)
                ->whereNotIn('id', $incomingIds)
                ->delete();

            $total = 0;
            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                GrnItem::updateOrCreate(
                    ['id' => $item['id'] ?? null],
                    [
                        'grn_id'                 => $grn->id,
                        'purchase_order_item_id' => $item['purchase_order_item_id'],
                        'quantity'               => $item['quantity'],
                        'unit_price'             => $item['unit_price'],
                        'total_price'            => $lineTotal,
                        'remarks'                => $item['remarks'] ?? null,
                    ]
                );
                $total += $lineTotal;
            }

            $ledger = GrnLedger::firstOrCreate(
                ['grn_id' => $grn->id],
                ['date' => $grn->date, 'remarks' => 'GRN entry']
            );
            $ledger->update(['credit' => $total, 'amount' => $total]);

            DB::commit();
            Log::info('GRN updated successfully', ['grn_id' => $grn->id]);
            return redirect()->route('dashboard.grn.index')
                ->with('success', 'GRN updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('GRN update error', ['exception' => $e->getMessage()]);
            return back()->withInput()->with('error', 'Could not update GRN. Try again.');
        }
    }

    /* ---------- DESTROY ---------- */
    public function destroy($grnId)
    {
        $grn = Grn::findOrFail($grnId);
        try {
            $grn->delete();
            Log::info('GRN deleted', ['grn_id' => $grnId]);
            return redirect()->route('dashboard.grn.index')
                ->with('success', 'GRN deleted successfully.');
        } catch (\Throwable $e) {
            Log::error('GRN delete error', ['exception' => $e->getMessage()]);
            return back()->with('error', 'Could not delete GRN.');
        }
    }

    public function searchSuppliers(Request $request): JsonResponse
    {
        $term = $request->query('q', '');
        $suppliers = Supplier::select('id', 'name', 'mobile', 'email')
            ->where(function ($q) use ($term) {
                $q->where('name',   'like', "%{$term}%")
                    ->orWhere('mobile', 'like', "%{$term}%")
                    ->orWhere('email',  'like', "%{$term}%");
            })
            ->limit(10)
            ->get();
        return response()->json($suppliers);
    }
}
