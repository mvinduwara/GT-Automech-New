<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleModel;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'vehicle_brand_id' => 'required|exists:vehicle_brands,id',
        ]);

        VehicleModel::create($validated);

        return redirect()->back()->with('success', 'Model added successfully!');
    }
}
