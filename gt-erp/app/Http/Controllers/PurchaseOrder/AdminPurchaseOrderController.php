<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPurchaseOrderController extends Controller
{
   public function index(Request $request)
    {
        return Inertia::render('purchase-order/admin/index');
    }
    public function view(Request $request)
    {
        return Inertia::render('purchase-order/admin/view');
    }
}
