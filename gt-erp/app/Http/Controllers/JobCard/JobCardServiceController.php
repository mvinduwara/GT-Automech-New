<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\JobCard;
use App\Models\JobCardVehicleService;
use App\Models\VehicleService;
use App\Models\VehicleServiceOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class JobCardServiceController extends Controller
{
    /**
     * Show the form data for managing services
     */
    public function edit(JobCard $jobCard)
    {
        try {
            $vehicleServices = VehicleService::with('options')
                ->where('status', 'active')
                ->get();

            $existingServices = $jobCard->jobCardVehicleServices()
                ->with(['vehicleService', 'vehicleServiceOption'])
                ->get();

            return response()->json([
                'vehicleServices' => $vehicleServices,
                'existingServices' => $existingServices,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load job card services', [
                'job_card_id' => $jobCard->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to load services data'
            ], 500);
        }
    }

    /**
     * Store or update job card vehicle services
     */
    public function store(Request $request, JobCard $jobCard)
    {
        $validated = $request->validate([
            'services' => 'required|array|min:1',
            'services.*.vehicle_service_id' => 'required|exists:vehicle_services,id',
            'services.*.vehicle_service_option_id' => 'required|exists:vehicle_service_options,id',
            'services.*.is_included' => 'required|boolean',
            'services.*.discount_type' => ['nullable', Rule::in(['percentage', 'amount'])],
            'services.*.discount_value' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Delete existing services for this job card
            $jobCard->jobCardVehicleServices()->delete();

            $createdServices = [];

            foreach ($validated['services'] as $serviceData) {
                // Get the service option to fetch price
                $serviceOption = VehicleServiceOption::findOrFail($serviceData['vehicle_service_option_id']);
                
                $subtotal = $serviceOption->price;
                $discountType = $serviceData['discount_type'] ?? null;
                $discountValue = $serviceData['discount_value'] ?? 0;

                // Calculate total based on discount
                $total = $subtotal;
                if ($discountType === 'percentage' && $discountValue > 0) {
                    $total = $subtotal - ($subtotal * $discountValue / 100);
                } elseif ($discountType === 'amount' && $discountValue > 0) {
                    $total = max(0, $subtotal - $discountValue);
                }

                // Create the job card vehicle service
                $jobCardService = JobCardVehicleService::create([
                    'job_card_id' => $jobCard->id,
                    'vehicle_service_id' => $serviceData['vehicle_service_id'],
                    'vehicle_service_option_id' => $serviceData['vehicle_service_option_id'],
                    'is_included' => $serviceData['is_included'],
                    'subtotal' => $subtotal,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'total' => $total,
                ]);

                $createdServices[] = $jobCardService;

                Log::info('Job card service created', [
                    'job_card_id' => $jobCard->id,
                    'service_id' => $jobCardService->id,
                    'vehicle_service_id' => $serviceData['vehicle_service_id'],
                    'option_id' => $serviceData['vehicle_service_option_id'],
                    'subtotal' => $subtotal,
                    'total' => $total,
                    'is_included' => $serviceData['is_included']
                ]);
            }

            DB::commit();

            Log::info('Job card services saved successfully', [
                'job_card_id' => $jobCard->id,
                'services_count' => count($createdServices),
                'total_amount' => collect($createdServices)
                    ->where('is_included', true)
                    ->sum('total')
            ]);

            return redirect()->back()->with('success', 'Services saved successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            Log::warning('Validation failed for job card services', [
                'job_card_id' => $jobCard->id,
                'errors' => $e->errors()
            ]);

            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to save job card services', [
                'job_card_id' => $jobCard->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to save services. Please try again.')
                ->withInput();
        }
    }

    /**
     * Delete a specific job card vehicle service
     */
    public function destroy(JobCard $jobCard, JobCardVehicleService $service)
    {
        try {
            // Verify the service belongs to this job card
            if ($service->job_card_id !== $jobCard->id) {
                Log::warning('Attempted to delete service from wrong job card', [
                    'job_card_id' => $jobCard->id,
                    'service_job_card_id' => $service->job_card_id,
                    'service_id' => $service->id
                ]);

                return redirect()->back()->with('error', 'Invalid service deletion request');
            }

            $serviceId = $service->id;
            $service->delete();

            Log::info('Job card service deleted successfully', [
                'job_card_id' => $jobCard->id,
                'service_id' => $serviceId
            ]);

            return redirect()->back()->with('success', 'Service removed successfully');

        } catch (\Exception $e) {
            Log::error('Failed to delete job card service', [
                'job_card_id' => $jobCard->id,
                'service_id' => $service->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to remove service. Please try again.');
        }
    }

    /**
     * Toggle service inclusion status
     */
    public function toggleInclusion(JobCard $jobCard, JobCardVehicleService $service)
    {
        try {
            // Verify the service belongs to this job card
            if ($service->job_card_id !== $jobCard->id) {
                Log::warning('Attempted to toggle service from wrong job card', [
                    'job_card_id' => $jobCard->id,
                    'service_job_card_id' => $service->job_card_id,
                    'service_id' => $service->id
                ]);

                return redirect()->back()->with('error', 'Invalid service update request');
            }

            $service->is_included = !$service->is_included;
            $service->save();

            Log::info('Job card service inclusion toggled', [
                'job_card_id' => $jobCard->id,
                'service_id' => $service->id,
                'is_included' => $service->is_included
            ]);

            return redirect()->back()->with('success', 
                $service->is_included ? 'Service included' : 'Service excluded'
            );

        } catch (\Exception $e) {
            Log::error('Failed to toggle service inclusion', [
                'job_card_id' => $jobCard->id,
                'service_id' => $service->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to update service. Please try again.');
        }
    }
}