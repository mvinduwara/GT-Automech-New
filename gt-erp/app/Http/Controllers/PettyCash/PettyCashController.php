<?php

namespace App\Http\Controllers\PettyCash;

use App\Http\Controllers\Controller;
use App\Models\PettyCashVoucher;
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
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('petty-cash/index', ['petty_cash' => $petty_cash]);
    }

    public function create(Request $request)
    {
        return Inertia::render('petty-cash/create');
    }
    public function edit($voucher_number)
    {
        $pettyCash = PettyCashVoucher::where('voucher_number', $voucher_number)->firstOrFail();
        return Inertia::render('petty-cash/edit', [
            'petty_cash' => $pettyCash,
        ]);
    }
}
