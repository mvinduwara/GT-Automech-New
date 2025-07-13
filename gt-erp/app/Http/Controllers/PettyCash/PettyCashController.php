<?php

namespace App\Http\Controllers\PettyCash;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('petty-cash/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('petty-cash/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('petty-cash/edit');
    }
}
