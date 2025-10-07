<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleBrand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleBrandController extends Controller
{
    public function index()
    {
        $brands = VehicleBrand::withCount('models')
            ->latest()
            ->paginate(10);

        return Inertia::render('VehicleBrands/index', [
            'brands' => $brands
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_brands,name',
        ]);

        VehicleBrand::create($validated);

        return redirect()->back()->with('success', 'Brand added successfully!');
    }

    public function update(Request $request, VehicleBrand $vehicleBrand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_brands,name,' . $vehicleBrand->id,
        ]);

        $vehicleBrand->update($validated);

        return redirect()->back()->with('success', 'Brand updated successfully!');
    }

    public function destroy(VehicleBrand $vehicleBrand)
    {
        // Check if brand has models
        if ($vehicleBrand->models()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete brand with existing models!');
        }

        $vehicleBrand->delete();

        return redirect()->back()->with('success', 'Brand deleted successfully!');
    }
}
