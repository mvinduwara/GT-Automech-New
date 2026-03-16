<?php

namespace App\Http\Controllers\PettyCash;

use App\Actions\Finance\CreateLedgerEntries;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\PettyCashVoucher;
use App\Models\PettyCashItem;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PettyCashController extends Controller
{
    public function index(Request $request)
    {
        $petty_cash = PettyCashVoucher::with(['requestedBy', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Imprest Summary
        $imprestLimit = (float) \App\Models\Setting::get('petty_cash_imprest_limit', 0);
        $pettyCashAccountId = \App\Models\Setting::get('default_petty_cash_account_id');
        
        $currentBalance = 0;
        if ($pettyCashAccountId) {
            $currentBalance = \App\Models\LedgerEntry::where('account_id', $pettyCashAccountId)
                ->selectRaw('SUM(debit) - SUM(credit) as balance')
                ->value('balance') ?: 0;
        }

        return Inertia::render('petty-cash/index', [
            'petty_cash' => $petty_cash,
            'imprest_summary' => [
                'limit' => $imprestLimit,
                'current_balance' => (float)$currentBalance,
                'shortfall' => max(0, $imprestLimit - $currentBalance),
            ]
        ]);
    }

    public function show($voucher_number)
    {
        $petty_cash = PettyCashVoucher::with(['requestedBy', 'approvedBy', 'items'])
            ->where('voucher_number', $voucher_number)
            ->firstOrFail();

        return Inertia::render('petty-cash/show', [
            'voucher' => $petty_cash
        ]);
    }

    public function create(Request $request)
    {
        // Generate auto-number
        $lastVoucher = PettyCashVoucher::latest()->first();
        $nextNumber = 1;
        if ($lastVoucher) {
            $lastNum = str_replace('PCV-' . date('Ymd') . '-', '', $lastVoucher->voucher_number);
            if (is_numeric($lastNum)) {
                $nextNumber = intval($lastNum) + 1;
            }
        }
        $autoVoucherNumber = 'PCV-' . date('Ymd') . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return Inertia::render('petty-cash/create', [
            'auto_voucher_number' => $autoVoucherNumber
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'voucher_number' => 'required|string|unique:petty_cash_vouchers,voucher_number',
            'date' => 'required|date',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'requested_amount' => 'required|numeric|min:0',
        ]);

        try {
            // Create the voucher
            $voucher = PettyCashVoucher::create([
                'voucher_number' => $validated['voucher_number'],
                'date' => $validated['date'],
                'requested_by_user_id' => auth()->id(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'requested_amount' => $validated['requested_amount'],
                'total_amount' => 0, // Not spent yet
                'status' => 'pending',
            ]);

            return redirect()->route('dashboard.petty-cash.index')->with('success', 'Voucher request created successfully!');
        } catch (\Exception $e) {
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

            // Delete associated ledger entries
            $pettyCash->ledgerEntries()->delete();

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

    public function setPaidx($voucher_number)
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

        // $voucher = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        return back()->with('success', 'Voucher marked as paid!');
    }

    public function setPaid($voucher_number)
    {
        // Check if user is service manager or admin
        $userRole = auth()->user()->role;
        if (!in_array($userRole, ['service-manager', 'admin'])) {
            return back()->withErrors(['error' => 'Unauthorized Access.']);
        }

        $voucher = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        // Only allow approved vouchers to be set to paid
        if ($voucher->status !== 'approved') {
            return back()->withErrors(['error' => 'Only approved vouchers can be set to paid.']);
        }

        try {
            DB::transaction(function () use ($voucher) {
                // 1. Update the Voucher status
                $voucher->update(['status' => 'paid']);

                // 2. Record the transaction in the financial ledger
                // Use default accounts from settings if available
                $expenseAccountId = \App\Models\Setting::get('default_petty_cash_account_id', '5000');
                $cashAccountId = \App\Models\Setting::get('default_cash_account_id', '1000');

                // 2. Record the transaction in the financial ledger
                $drawerAccountId = \App\Models\Setting::get('default_petty_cash_account_id');
                $bankAccountId = \App\Models\Setting::get('default_cash_account_id');

                if (!$drawerAccountId || !$bankAccountId) {
                    throw new \Exception('Please configure Default Petty Cash and Cash/Bank accounts in System Settings.');
                }

                $drawerAccount = Account::findOrFail($drawerAccountId);
                $bankAccount = Account::findOrFail($bankAccountId);

                CreateLedgerEntries::run(
                    description: "Petty cash movement for Voucher #{$voucher->voucher_number} - {$voucher->name}",
                    date: \Carbon\Carbon::parse($voucher->date),
                    amount: (float) $voucher->requested_amount,
                    debitAccount: $drawerAccount,
                    creditAccount: $bankAccount, 
                    transactionable: $voucher
                );
            });

            Log::info('Petty cash voucher marked as paid and ledger created', ['voucher_id' => $voucher->id]);
            return back()->with('success', 'Voucher marked as paid!');

        } catch (\Exception $e) {
            Log::error('Failed to mark voucher as paid', ['voucher_id' => $voucher->id, 'error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to process payment: ' . $e->getMessage()]);
        }
    }

    public function submitForReview(Request $request, $voucher_number)
    {
        $voucher = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        if (!in_array($voucher->status, ['paid', 'processed'])) {
            return back()->withErrors(['error' => 'Voucher must be in paid or processed status to submit for review.']);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.item_description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $actualAmount = collect($validated['items'])->sum('amount');
            $balanceAmount = $voucher->requested_amount - $actualAmount;

            // Handle proof upload
            $proofPath = $voucher->proof_path;
            if ($request->hasFile('proof')) {
                $proofPath = $request->file('proof')->store('petty-cash-proofs', 'public');
            }

            // Create items
            // Remove existing items if any (prevents duplicates on resubmit)
            $voucher->items()->delete();
            
            foreach ($validated['items'] as $itemData) {
                PettyCashItem::create([
                    'petty_cash_voucher_id' => $voucher->id,
                    'item_description' => $itemData['item_description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'amount' => $itemData['amount'],
                ]);
            }

            // Update voucher status to 'processed' (awaiting admin finalization)
            $voucher->update([
                'actual_amount' => $actualAmount,
                'total_amount' => $actualAmount,
                'balance_amount' => $balanceAmount,
                'proof_path' => $proofPath,
                'status' => 'processed', 
            ]);

            DB::commit();

            return redirect()->route('dashboard.petty-cash.show', $voucher_number)->with('success', 'Voucher submitted for review successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to submit voucher: ' . $e->getMessage()]);
        }
    }

    public function finalize(Request $request, $voucher_number)
    {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can finalize vouchers.']);
        }

        $voucher = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();

        if (!in_array($voucher->status, ['paid', 'processed'])) {
            return back()->withErrors(['error' => 'Voucher must be in paid or processed status for finalization.']);
        }

        // Optional: Save changes if admin edited items during finalization
        if ($request->has('items')) {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.item_description' => 'required|string|max:255',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.amount' => 'required|numeric|min:0',
                'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            ]);

            DB::beginTransaction();
            try {
                $actualAmount = collect($validated['items'])->sum('amount');
                $balanceAmount = $voucher->requested_amount - $actualAmount;

                // Handle proof upload
                $proofPath = $voucher->proof_path;
                if ($request->hasFile('proof')) {
                    $proofPath = $request->file('proof')->store('petty-cash-proofs', 'public');
                }

                $voucher->items()->delete();
                foreach ($validated['items'] as $itemData) {
                    PettyCashItem::create([
                        'petty_cash_voucher_id' => $voucher->id,
                        'item_description' => $itemData['item_description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'amount' => $itemData['amount'],
                    ]);
                }

                $voucher->update([
                    'actual_amount' => $actualAmount,
                    'total_amount' => $actualAmount,
                    'balance_amount' => $balanceAmount,
                    'proof_path' => $proofPath,
                ]);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->withErrors(['items' => 'Failed to save items: ' . $e->getMessage()]);
            }
        }

        DB::beginTransaction();

        try {
            // Update voucher status to 'finalized'
            $voucher->update([
                'status' => 'finalized', 
                'finalized_at' => now(),
            ]);

            // 1. Update the "Movement" entry (Bank -> Drawer) to match actual amount
            // This entry was created during "setPaid"
            $voucher->ledgerEntries()->where('debit', '>', 0)->update(['debit' => $voucher->actual_amount]);
            $voucher->ledgerEntries()->where('credit', '>', 0)->update(['credit' => $voucher->actual_amount]);

            // 2. If it's a REGULAR spend voucher, record the ACTUAL expense (Drawer -> Expense Account)
            if (!$voucher->is_replenishment) {
                $expenseAccountId = \App\Models\Setting::get('default_petty_cash_expense_account_id');
                $drawerAccountId = \App\Models\Setting::get('default_petty_cash_account_id');

                if ($expenseAccountId && $drawerAccountId && $voucher->actual_amount > 0) {
                    $expenseAccount = \App\Models\Account::findOrFail($expenseAccountId);
                    $drawerAccount = \App\Models\Account::findOrFail($drawerAccountId);

                    // Note: We don't use CreateLedgerEntries::run here because it might link to the same voucher 
                    // and cause confusion with the movement entry. Let's create it manually or with a unique description.
                    CreateLedgerEntries::run(
                        description: "Petty cash expenditure for Voucher #{$voucher->voucher_number}",
                        date: now(),
                        amount: (float) $voucher->actual_amount,
                        debitAccount: $expenseAccount,
                        creditAccount: $drawerAccount,
                        transactionable: $voucher
                    );
                }
            }

            DB::commit();

            return redirect()->route('dashboard.petty-cash.show', $voucher_number)->with('success', 'Voucher finalized successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to finalize voucher: ' . $e->getMessage()]);
        }
    }

    public function replenish(Request $request)
    {
        // 1. Calculate shortfall
        $imprestLimit = (float) \App\Models\Setting::get('petty_cash_imprest_limit', 0);
        $pettyCashAccountId = \App\Models\Setting::get('default_petty_cash_account_id');
        
        if ($imprestLimit <= 0) {
            return back()->withErrors(['error' => 'Please set the Imprest Limit in System Settings first.']);
        }

        $currentBalance = 0;
        if ($pettyCashAccountId) {
            $currentBalance = \App\Models\LedgerEntry::where('account_id', $pettyCashAccountId)
                ->selectRaw('SUM(debit) - SUM(credit) as balance')
                ->value('balance') ?: 0;
        }

        $shortfall = $imprestLimit - $currentBalance;

        if ($shortfall <= 0) {
            return back()->with('info', 'Petty cash is already at or above the target limit.');
        }

        // 2. Generate voucher number
        $lastVoucher = PettyCashVoucher::latest()->first();
        $nextNumber = 1;
        if ($lastVoucher) {
            $lastNum = str_replace('PCV-' . date('Ymd') . '-', '', $lastVoucher->voucher_number);
            if (is_numeric($lastNum)) {
                $nextNumber = intval($lastNum) + 1;
            }
        }
        $voucherNumber = 'PCV-' . date('Ymd') . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        // 3. Create the voucher
        $voucher = PettyCashVoucher::create([
            'voucher_number' => $voucherNumber,
            'date' => now(),
            'requested_by_user_id' => auth()->id(),
            'name' => 'Petty Cash Replenishment',
            'description' => "Auto-generated replenishment for shortfall of LKR " . number_format($shortfall, 2),
            'requested_amount' => $shortfall,
            'total_amount' => 0,
            'status' => 'pending',
            'is_replenishment' => true,
        ]);

        return redirect()->route('dashboard.petty-cash.show', $voucher->voucher_number)->with('success', 'Replenishment voucher created successfully!');
    }

    public function downloadPdf($voucher_number)
    {
        $voucher = PettyCashVoucher::with(['requestedBy', 'approvedBy', 'items'])
            ->where('voucher_number', $voucher_number)
            ->firstOrFail();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.petty-cash-voucher', compact('voucher'));

        return $pdf->download("PettyCashVoucher_{$voucher->voucher_number}.pdf");
    }
}
