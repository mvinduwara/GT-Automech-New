<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{

    public function index(Request $request)
    {
        return Inertia::render('customer/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('customer/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('customer/edit');
    }
}
