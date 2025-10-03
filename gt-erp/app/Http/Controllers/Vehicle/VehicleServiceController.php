<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleService;
use App\Models\VehicleServiceOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VehicleServiceController extends Controller
{
    public function index()
    {
        try {
            $vehicleServices = VehicleService::with(['options' => function ($query) {
                $query->orderBy('name');
            }])
                ->orderBy('name')
                ->get();

            Log::info('Vehicle services loaded successfully', [
                'count' => $vehicleServices->count()
            ]);

            return Inertia::render('vehicle-services/index', [
                'vehicleServices' => $vehicleServices
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load vehicle services', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load vehicle services');
        }
    }

    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:vehicle_services,name',
                'status' => 'required|string|in:active,deactive'
            ]);

            $vehicleService = VehicleService::create($validated);

            Log::info('Vehicle service created successfully', [
                'id' => $vehicleService->id,
                'name' => $vehicleService->name,
                'user_id' => auth()->id()
            ]);

            return back()->with('success', 'Vehicle service created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Vehicle service creation validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create vehicle service', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to create vehicle service');
        }
    }

    public function update(Request $request, $vehicleService_id)
    {
        try {
            $vehicleService = VehicleService::findOrFail($vehicleService_id);

            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('vehicle_services', 'name')->ignore($vehicleService->id)
                ],
                'status' => 'required|string|in:active,deactive'
            ]);

            $vehicleService->update($validated);

            Log::info('Vehicle service updated successfully', [
                'id' => $vehicleService->id,
                'name' => $vehicleService->name,
                'changes' => $vehicleService->getChanges(),
                'user_id' => auth()->id()
            ]);

            return back()->with('success', 'Vehicle service updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Vehicle service not found for update', [
                'id' => $vehicleService_id,
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Vehicle service not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Vehicle service update validation failed', [
                'id' => $vehicleService_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to update vehicle service', [
                'id' => $vehicleService_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to update vehicle service');
        }
    }

    public function serviceIndex($vehicleService_id)
    {
        try {
            $vehicleService = VehicleService::with(['options' => function ($query) {
                $query->orderBy('name');
            }])->findOrFail($vehicleService_id);

            Log::info('Vehicle service options loaded successfully', [
                'service_id' => $vehicleService_id,
                'service_name' => $vehicleService->name,
                'options_count' => $vehicleService->options->count()
            ]);

            return Inertia::render('vehicle-services/service/index', [
                'vehicleService' => $vehicleService
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Vehicle service not found', [
                'id' => $vehicleService_id,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('dashboard.vehicle-services.index')
                ->with('error', 'Vehicle service not found');
        } catch (\Exception $e) {
            Log::error('Failed to load vehicle service options', [
                'service_id' => $vehicleService_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('dashboard.vehicle-services.index')
                ->with('error', 'Failed to load vehicle service options');
        }
    }

    public function optionStore(Request $request, $vehicleService_id)
    {
        try {
            $vehicleService = VehicleService::findOrFail($vehicleService_id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'status' => 'required|string|in:active,deactive'
            ]);

            $validated['vehicle_service_id'] = $vehicleService_id;
            $option = VehicleServiceOption::create($validated);

            Log::info('Vehicle service option created successfully', [
                'id' => $option->id,
                'name' => $option->name,
                'service_id' => $vehicleService_id,
                'service_name' => $vehicleService->name,
                'user_id' => auth()->id()
            ]);

            return back()->with('success', 'Service option created successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Vehicle service not found for option creation', [
                'service_id' => $vehicleService_id,
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Vehicle service not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Vehicle service option creation validation failed', [
                'service_id' => $vehicleService_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create vehicle service option', [
                'service_id' => $vehicleService_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to create service option');
        }
    }

    public function optionUpdate(Request $request, $vehicleService_id, $vehicleServiceOption_id)
    {
        try {
            $vehicleService = VehicleService::findOrFail($vehicleService_id);
            $option = VehicleServiceOption::where('vehicle_service_id', $vehicleService_id)
                ->findOrFail($vehicleServiceOption_id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'status' => 'required|string|in:active,deactive'
            ]);

            $option->update($validated);

            Log::info('Vehicle service option updated successfully', [
                'id' => $option->id,
                'name' => $option->name,
                'service_id' => $vehicleService_id,
                'service_name' => $vehicleService->name,
                'changes' => $option->getChanges(),
                'user_id' => auth()->id()
            ]);

            return back()->with('success', 'Service option updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Vehicle service or option not found for update', [
                'service_id' => $vehicleService_id,
                'option_id' => $vehicleServiceOption_id,
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Service option not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Vehicle service option update validation failed', [
                'service_id' => $vehicleService_id,
                'option_id' => $vehicleServiceOption_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to update vehicle service option', [
                'service_id' => $vehicleService_id,
                'option_id' => $vehicleServiceOption_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to update service option');
        }
    }
}
