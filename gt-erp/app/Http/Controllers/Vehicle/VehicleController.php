<?php

// File: app/Http/Controllers/VehicleController.php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VehicleController extends Controller
{
    /**
     * Display a listing of the vehicles.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request): \Inertia\Response
    {
        $query = Vehicle::with(['brand', 'model']);

        // Search by vehicle_no
        if ($search = $request->query('search')) {
            $query->where('vehicle_no', 'like', '%' . $search . '%');
        }

        // Filter by year
        if ($year = $request->query('year')) {
            $query->where('make_year', $year);
        }

        // Filter by brand
        if ($brandId = $request->query('brand')) {
            $query->where('vehicle_brand_id', $brandId);
        }

        // Filter by model
        if ($modelId = $request->query('model')) {
            $query->where('vehicle_model_id', $modelId);
        }

        $vehicles = $query->paginate(20)->withQueryString();

        $brands = VehicleBrand::orderBy('name')->get(['id', 'name']);
        $models = VehicleModel::orderBy('name')->get(['id', 'name']);
        $years = Vehicle::select('make_year')->distinct()->orderBy('make_year', 'desc')->pluck('make_year');

        return Inertia::render('vehicle/index', [
            'vehicles' => $vehicles,
            'brands' => $brands,
            'models' => $models,
            'years' => $years,
            'filters' => $request->only(['search', 'year', 'brand', 'model']),
        ]);
    }

    /**
     * Show the form for creating a new vehicle.
     *
     * @return \Inertia\Response
     */
    public function create(): \Inertia\Response
    {
        $brands = VehicleBrand::orderBy('name')->get(['id', 'name']);
        $models = VehicleModel::orderBy('name')->get(['id', 'name','vehicle_brand_id']);
        return Inertia::render('vehicle/create', [
            'brands' => $brands,
            'models' => $models,
        ]);
    }

    /**
     * Store a newly created vehicle in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'vehicle_no' => ['required', 'string', 'max:255', 'unique:vehicles'],
            'vehicle_brand_id' => ['nullable', 'exists:vehicle_brands,id'],
            'vehicle_model_id' => ['nullable', 'exists:vehicle_models,id'],
            'make_year' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
        ]);

        try {
            DB::beginTransaction();
            Vehicle::create($request->all());
            DB::commit();
            return redirect()->route('dashboard.vehicle.index')->with('success', 'Vehicle created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating vehicle: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create vehicle. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified vehicle.
     *
     * @param \App\Models\Vehicle $vehicle
     * @return \Inertia\Response
     */
    public function edit(Vehicle $vehicle): \Inertia\Response
    {
        $brands = VehicleBrand::orderBy('name')->get(['id', 'name']);
        $models = VehicleModel::orderBy('name')->get(['id', 'name']);
        return Inertia::render('vehicle/edit', [
            'vehicle' => $vehicle->load('brand', 'model'),
            'brands' => $brands,
            'models' => $models,
        ]);
    }

    /**
     * Update the specified vehicle in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Vehicle $vehicle
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Vehicle $vehicle): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'vehicle_no' => ['required', 'string', 'max:255', 'unique:vehicles,vehicle_no,' . $vehicle->id],
            'vehicle_brand_id' => ['nullable', 'exists:vehicle_brands,id'],
            'vehicle_model_id' => ['nullable', 'exists:vehicle_models,id'],
            'make_year' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
        ]);

        try {
            DB::beginTransaction();
            $vehicle->update($request->all());
            DB::commit();
            return redirect()->route('dashboard.vehicle.index')->with('success', 'Vehicle updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating vehicle: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update vehicle. Please try again.');
        }
    }

    /**
     * Remove the specified vehicle from storage.
     *
     * @param \App\Models\Vehicle $vehicle
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Vehicle $vehicle): \Illuminate\Http\RedirectResponse
    {
        try {
            DB::beginTransaction();
            $vehicle->delete();
            DB::commit();
            return redirect()->route('dashboard.vehicle.index')->with('success', 'Vehicle deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting vehicle: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete vehicle. Please try again.');
        }
    }

    public function search(Request $request)
    {
        try {
            $request->validate([
                'vehicleNumber' => 'required|string|min:3|max:255',
            ]);

            $query = $request->query('vehicleNumber');
            $searchTerm = '%' . trim($query) . '%';

            $vehicles = Vehicle::with(['brand', 'model'])
                ->where('vehicle_no', 'like', $searchTerm)
                ->orderBy('id', 'desc')
                ->take(10)
                ->get();

            $message = $vehicles->isEmpty() ? 'No vehicles found.' : 'vehicles retrieved successfully.';

            return response()->json([
                'message' => $message,
                'data' => $vehicles->map(function ($vehicle) {
                    return [
                        'id' => $vehicle->id,
                        'vehicle_no' => $vehicle->vehicle_no,
                        'vehicle_brand_id' => $vehicle->vehicle_brand_id,
                        'vehicle_model_id' => $vehicle->vehicle_model_id,
                        'make_year' => $vehicle->make_year,
                        'brand' => $vehicle->brand,
                        'model' => $vehicle->model,
                    ];
                })->toArray(),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in searchCustomer: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while searching for vehicles.',
                'data' => [],
            ], 500);
        }
    }
}
