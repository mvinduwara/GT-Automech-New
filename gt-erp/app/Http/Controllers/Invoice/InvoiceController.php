<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('invoice/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('invoice/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('invoice/edit');
    }
}
