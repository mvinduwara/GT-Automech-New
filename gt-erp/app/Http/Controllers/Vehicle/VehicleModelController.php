<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleModelController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('vehicle/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('vehicle/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('vehicle/edit');
    }
}
