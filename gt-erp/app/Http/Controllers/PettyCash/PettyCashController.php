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
        $petty_cash = PettyCashVoucher::with(['requestedBy', 'approvedBy'])
            ->select(
                'id',
                'voucher_number',
                'date',
                'name',
                'requested_by_user_id',
                'approved_by_user_id',
                'description',
                'total_amount',
                'status',
                'checked'
            )
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
}
