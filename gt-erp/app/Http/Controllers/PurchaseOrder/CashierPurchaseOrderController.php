<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierPurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('purchase-order/cashier/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('purchase-order/cashier/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('purchase-order/cashier/edit');
    }
}
