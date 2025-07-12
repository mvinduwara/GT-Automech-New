<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{

    public function index(Request $request)
    {
        return Inertia::render('stock/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('stock/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('stock/edit');
    }
}
