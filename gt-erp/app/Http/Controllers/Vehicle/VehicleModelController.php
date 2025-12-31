<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleModel;
use App\Models\VehicleBrand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleModelController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('query');
        
        $models = VehicleModel::where('name', 'like', "%{$query}%")
            ->limit(20)
            ->get(['id', 'name']);
            
        return response()->json($models);
    }

    public function index()
    {
        $models = VehicleModel::with('brand')
            ->latest()
            ->paginate(10);

        $brands = VehicleBrand::orderBy('name')->get(['id', 'name']);

        return Inertia::render('VehicleModels/index', [
            'models' => $models,
            'brands' => $brands,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_brand_id' => 'required|exists:vehicle_brands,id',
            'name' => 'required|string|max:255|unique:vehicle_models,name',
        ]);

        VehicleModel::create($validated);

        return redirect()->back()->with('success', 'Model added successfully!');
    }

    public function update(Request $request, VehicleModel $vehicleModel)
    {
        $validated = $request->validate([
            'vehicle_brand_id' => 'required|exists:vehicle_brands,id',
            'name' => 'required|string|max:255|unique:vehicle_models,name,' . $vehicleModel->id,
        ]);

        $vehicleModel->update($validated);

        return redirect()->back()->with('success', 'Model updated successfully!');
    }

    public function destroy(VehicleModel $vehicleModel)
    {
        // Optional: Check if model is used in vehicles before deleting
        if (method_exists($vehicleModel, 'vehicles') && $vehicleModel->vehicles()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete model linked with vehicles!');
        }

        $vehicleModel->delete();

        return redirect()->back()->with('success', 'Model deleted successfully!');
    }
}
