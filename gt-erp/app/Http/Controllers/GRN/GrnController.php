<?php

namespace App\Http\Controllers\GRN;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GrnController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('grn/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('grn/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('grn/edit');
    }
}
