<?php

namespace App\Http\Controllers\PettyCash;

use App\Http\Controllers\Controller;
use App\Models\PettyCashVoucher;
use App\Models\PettyCashItem;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PettyCashController extends Controller
{
    public function index(Request $request)
    {
        $petty_cash = PettyCashVoucher::with(['requestedBy', 'approvedBy', 'items'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('petty-cash/index', ['petty_cash' => $petty_cash]);
    }

    public function create(Request $request)
    {
        $users = User::select('id', 'name')->where('status', 'active')->get();

        return Inertia::render('petty-cash/create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'voucher_number' => 'required|string|unique:petty_cash_vouchers,voucher_number',
            'date' => 'required|date',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Calculate total amount from items
            $totalAmount = collect($validated['items'])->sum('amount');

            // Create the voucher
            $voucher = PettyCashVoucher::create([
                'voucher_number' => $validated['voucher_number'],
                'date' => $validated['date'],
                'requested_by_user_id' => auth()->id(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            // Create the items
            foreach ($validated['items'] as $itemData) {
                PettyCashItem::create([
                    'petty_cash_voucher_id' => $voucher->id,
                    'item_description' => $itemData['item_description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'amount' => $itemData['amount'],
                    'checked' => false,
                ]);
            }

            DB::commit();

            return redirect()->route('dashboard.petty-cash.index')->with('success', 'Voucher created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create voucher: ' . $e->getMessage()])->withInput();
        }
    }

    public function edit($voucher_number)
    {
        $pettyCash = PettyCashVoucher::with('items')
            ->where('voucher_number', $voucher_number)
            ->firstOrFail();

        return Inertia::render('petty-cash/edit', [
            'petty_cash' => $pettyCash,
        ]);
    }

    public function update(Request $request, $voucher_number)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:petty_cash_items,id',
            'items.*.item_description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $voucher = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

            // Calculate total amount from items
            $totalAmount = collect($validated['items'])->sum('amount');

            // Update the voucher
            $voucher->update([
                'date' => $validated['date'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'total_amount' => $totalAmount,
            ]);

            // Get existing item IDs
            $existingItemIds = collect($validated['items'])
                ->pluck('id')
                ->filter()
                ->toArray();

            // Delete items that are no longer in the list
            PettyCashItem::where('petty_cash_voucher_id', $voucher->id)
                ->whereNotIn('id', $existingItemIds)
                ->delete();

            // Update or create items
            foreach ($validated['items'] as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    PettyCashItem::where('id', $itemData['id'])
                        ->update([
                            'item_description' => $itemData['item_description'],
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price'],
                            'amount' => $itemData['amount'],
                        ]);
                } else {
                    // Create new item
                    PettyCashItem::create([
                        'petty_cash_voucher_id' => $voucher->id,
                        'item_description' => $itemData['item_description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'amount' => $itemData['amount'],
                        'checked' => false,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('dashboard.petty-cash.index')->with('success', 'Voucher updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update voucher: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy($voucher_number)
    {
        DB::beginTransaction();

        try {
            $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

            // Delete associated items first
            PettyCashItem::where('petty_cash_voucher_id', $pettyCash->id)->delete();

            // Delete the voucher
            $pettyCash->delete();

            DB::commit();

            return redirect()->route('dashboard.petty-cash.index')->with('success', 'Voucher deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete voucher: ' . $e->getMessage()]);
        }
    }

    // Admin methods for approve/reject
    public function approve($voucher_number)
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return back()->withErrors(['error' => 'Unauthorized. Admin access required.']);
        }

        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        // Check if already approved or rejected
        if ($pettyCash->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending vouchers can be approved.']);
        }

        $pettyCash->update([
            'status' => 'approved',
            'approved_by_user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Voucher approved successfully!');
    }

    public function reject($voucher_number)
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return back()->withErrors(['error' => 'Unauthorized. Admin access required.']);
        }

        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        // Check if already approved or rejected
        if ($pettyCash->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending vouchers can be rejected.']);
        }

        $pettyCash->update([
            'status' => 'rejected',
            'approved_by_user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Voucher rejected successfully!');
    }

    // Service Manager methods for pending/paid
    public function setPending($voucher_number)
    {
        // Check if user is service manager
        if (auth()->user()->role !== 'service-manager') {
            return back()->withErrors(['error' => 'Unauthorized. Service Manager access required.']);
        }

        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        // Only allow approved vouchers to be set to pending
        if ($pettyCash->status !== 'approved') {
            return back()->withErrors(['error' => 'Only approved vouchers can be set to pending.']);
        }

        $pettyCash->update(['status' => 'pending']);

        return back()->with('success', 'Voucher status changed to pending!');
    }

    public function setPaid($voucher_number)
    {
        // Check if user is service manager
        if (auth()->user()->role !== 'service-manager') {
            return back()->withErrors(['error' => 'Unauthorized. Service Manager access required.']);
        }

        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        // Only allow approved vouchers to be set to paid
        if ($pettyCash->status !== 'approved') {
            return back()->withErrors(['error' => 'Only approved vouchers can be set to paid.']);
        }

        $pettyCash->update(['status' => 'paid']);

        return back()->with('success', 'Voucher marked as paid!');
    }
}
