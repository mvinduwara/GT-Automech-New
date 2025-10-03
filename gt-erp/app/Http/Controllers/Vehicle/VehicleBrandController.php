<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleBrand;
use Illuminate\Http\Request;

class VehicleBrandController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_brands,name',
        ]);

        VehicleBrand::create($validated);

        return redirect()->back()->with('success', 'Brand added successfully!');
    }
}
