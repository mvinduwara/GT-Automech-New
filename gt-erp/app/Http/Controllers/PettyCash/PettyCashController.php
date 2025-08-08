<?php

namespace App\Http\Controllers\PettyCash;

use App\Http\Controllers\Controller;
use App\Models\PettyCashVoucher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            'approved_by_user_id' => 'nullable|exists:users,id',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'total_amount' => 'required|numeric',
        ]);

        // Set values from backend logic
        $validated['requested_by_user_id'] = auth()->id(); // Automatically set
        $validated['status'] = 'pending'; // Always 'pending'
        $validated['checked'] = false; // Always false

        PettyCashVoucher::create($validated);

        return redirect()->route('dashboard.petty-cash.index')->with('success', 'Voucher created successfully!');
    }

    public function edit($voucher_number)
    {
        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();
        return Inertia::render('petty-cash/edit', [
            'petty_cash' => $pettyCash,
        ]);
    }

    public function destroy($voucher_number)
    {
        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();
        $pettyCash->delete();

        return redirect()->route('dashboard.petty-cash.index')->with('success', 'Voucher deleted successfully!');
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