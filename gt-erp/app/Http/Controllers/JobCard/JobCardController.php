<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\JobCard;
use App\Models\Vehicle;
use App\Models\VehicleService;
use App\Traits\SendsSms;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class JobCardController extends Controller
{
    use SendsSms;

    public function index(Request $request)
    {
        $query = JobCard::with(['customer', 'vehicle', 'user'])
            ->orderBy('id', 'desc');

        // 🔍 Search (by job card no, customer name, or vehicle no)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('job_card_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('vehicle', fn($vq) => $vq->where('vehicle_no', 'like', "%{$search}%"));
            });
        }

        // 🏷️ Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // 🏷️ Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Pending job cards (separate for grid)
        $pendingJobCards = JobCard::with(['customer', 'vehicle'])
            ->where('status', 'pending')
            ->latest()
            ->take(6) // show only latest 6 in grid
            ->get();

        $jobCards = $query->paginate(20)->withQueryString();

        return Inertia::render('job-card/index', [
            'jobCards' => $jobCards,
            'pendingJobCards' => $pendingJobCards,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function open(Request $request)
    {
        return Inertia::render('job-card/open');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'vehicle_id' => 'required|exists:vehicles,id',
                'customer_id' => 'required|exists:customers,id',
                'mileage' => 'required|numeric',
                'remarks' => 'nullable|string',
            ]);

            $validated['job_card_no'] = 'JC-' . Str::upper(Str::random(8));
            $validated['user_id'] = auth()->id();
            $validated['date'] = now();
            $validated['type'] = 'general';
            $validated['status'] = 'pending';

            $jobCard = JobCard::create($validated);

            $customer = $jobCard->customer;
            $vehicle = $jobCard->vehicle;

            $name = $customer->name ?? 'Customer';
            $phone = $customer->mobile ?? null;
            $vehicleName = $vehicle->vehicle_name ?? 'your vehicle';
            $vehicleType = $vehicle->type ?? '';

            Log::info('Checking customer phone for Job Card SMS', [
                'job_card_id' => $jobCard->id,
                'customer_id' => $jobCard->customer_id,
                'customer_object_loaded' => $customer ? true : false,
                'phone_variable_value' => $phone // <--- THIS IS THE KEY VALUE TO CHECK
            ]);

            if ($phone) {
                // 2. === ADD THIS LOG (INSIDE THE 'IF') ===
                // This will only run if the 'if ($phone)' check passes
                Log::info('Attempting to send Job Card creation SMS...', [
                    'job_card_id' => $jobCard->id,
                    'phone' => $phone
                ]);

                $name = $customer->name ?? 'Customer';
                // Get vehicle number
                $vehicleNo = $vehicle->vehicle_no ?? 'your vehicle';

                // $message = "Dear $name,\n" .
                //     "Your job card {$jobCard->job_card_no} for vehicle $vehicleNo has been created.\n" . //
                //     "Status: Pending Approval\n" .
                //     "We will notify you once confirmed.\n" .
                //     "- GT AutoMech";

                $message = "Dear Valued Customer,\n\n" .
                    "Thank you for choosing GT Automech.\n\n" .
                    "Job Card #: {$jobCard->job_card_no}\n" .
                    "Date: {$jobCard->date}\n" .
                    "Vehicle No: $vehicleNo\n" .
                    "Vehicle Model: {$jobCard->vehicle->model->name}\n" .
                    "Mileage: {$jobCard->mileage} km\n\n" .
                    "Your vehicle is now in our care.\n\n" .
                    "For inquiries: 077-409-8580";

                // 3. This call now uses the Trait's sendSms method
                $this->sendSMS($phone, $message);
            }

            Log::info('Job Card created successfully', ['job_card_id' => $jobCard->id]);

            return redirect()
                ->route('dashboard.job-card.form', ['jobcard_id' => $jobCard->id])
                ->with('success', 'Job Card created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating Job Card', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Something went wrong while creating the job card.');
        }
    }

    public function form($jobCard_id)
    {
        try {
            $jobCard = JobCard::with([
                'customer',
                'vehicle.brand',
                'vehicle.model',
                'user',
                'jobCardVehicleServices.vehicleService',
                'jobCardVehicleServices.vehicleServiceOption',
                'jobCardCharges',
                'jobCardProducts.stock.product',
                'invoice' // Add this
            ])->findOrFail($jobCard_id);

            Log::info('Job Card form accessed', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'user_id' => auth()->id(),
            ]);

            $vehicleServices = VehicleService::with(['options' => function ($query) {
                $query->where('status', 'active');
            }])
                ->where('status', 'active')
                ->get();

            $existingServices = $jobCard->jobCardVehicleServices;
            $existingCharges = $jobCard->jobCardCharges;
            $existingProducts = $jobCard->jobCardProducts;

            Log::info('Job card loaded successfully', [
                'job_card_id' => $jobCard->id,
                'services_count' => $existingServices->count(),
                'charges_count' => $existingCharges->count(),
                'products_count' => $existingProducts->count(),
                'has_invoice' => $jobCard->invoice ? true : false
            ]);

            return Inertia::render('job-card/form', [
                'jobCard' => $jobCard,
                'vehicleServices' => $vehicleServices,
                'existingServices' => $existingServices,
                'existingCharges' => $existingCharges,
                'existingProducts' => $existingProducts,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->route('dashboard.job-card.index')
                ->with('error', 'Job Card not found');
        } catch (\Exception $e) {
            Log::error('Error loading Job Card form', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->route('dashboard.job-card.index')
                ->with('error', 'Something went wrong while loading the job card.');
        }
    }

    /**
     * Update job card type
     */
    public function updateType(Request $request, JobCard $jobCard)
    {
        $validated = $request->validate([
            'type' => 'required|in:general,service,insurance',
        ]);

        try {
            $oldType = $jobCard->type;

            $jobCard->update([
                'type' => $validated['type'],
            ]);

            Log::info('Job card type updated', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_type' => $oldType,
                'new_type' => $validated['type'],
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->with('success', 'Job card type updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update job card type', [
                'job_card_id' => $jobCard->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to update type');
        }
    }

    public function updateCustomer(Request $request, $jobCard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'customer_id' => [
                    'required',
                    'exists:customers,id',
                    'different:' . $jobCard->customer_id,
                ],
            ], [
                'customer_id.required' => 'Customer ID is required.',
                'customer_id.exists' => 'Selected customer does not exist.',
                'customer_id.different' => 'The selected customer is already assigned to this job card.',
            ]);

            $oldCustomerId = $jobCard->customer_id;
            $oldCustomer = $jobCard->customer;

            // Reassign customer to job card
            $jobCard->update([
                'customer_id' => $validated['customer_id'],
            ]);

            $newCustomer = Customer::find($validated['customer_id']);

            Log::info('Customer reassigned successfully for Job Card', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_customer_id' => $oldCustomerId,
                'old_customer_name' => $oldCustomer->name,
                'new_customer_id' => $newCustomer->id,
                'new_customer_name' => $newCustomer->name,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Customer reassigned successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for customer reassignment', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Customer reassignment validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error reassigning customer for Job Card', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while reassigning the customer.');
        }
    }

    public function updateVehicle(Request $request, $jobCard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'vehicle_id' => [
                    'required',
                    'exists:vehicles,id',
                    'different:' . $jobCard->vehicle_id,
                ],
            ], [
                'vehicle_id.required' => 'Vehicle ID is required.',
                'vehicle_id.exists' => 'Selected vehicle does not exist.',
                'vehicle_id.different' => 'The selected vehicle is already assigned to this job card.',
            ]);

            $oldVehicleId = $jobCard->vehicle_id;
            $oldVehicle = $jobCard->vehicle;

            // Reassign vehicle to job card
            $jobCard->update([
                'vehicle_id' => $validated['vehicle_id'],
            ]);

            $newVehicle = Vehicle::with(['brand', 'model'])->find($validated['vehicle_id']);

            Log::info('Vehicle reassigned successfully for Job Card', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_vehicle_id' => $oldVehicleId,
                'old_vehicle_no' => $oldVehicle->vehicle_no,
                'new_vehicle_id' => $newVehicle->id,
                'new_vehicle_no' => $newVehicle->vehicle_no,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Vehicle reassigned successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for vehicle reassignment', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Vehicle reassignment validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error reassigning vehicle for Job Card', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while reassigning the vehicle.');
        }
    }

    public function updateMileage(Request $request, $jobCard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'mileage' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:9999999',
                ],
            ], [
                'mileage.required' => 'Mileage is required.',
                'mileage.numeric' => 'Mileage must be a number.',
                'mileage.min' => 'Mileage cannot be negative.',
                'mileage.max' => 'Mileage value is too large.',
            ]);

            $oldMileage = $jobCard->mileage;
            $jobCard->update($validated);

            Log::info('Job Card mileage updated successfully', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_mileage' => $oldMileage,
                'new_mileage' => $jobCard->mileage,
                'mileage_difference' => $jobCard->mileage - $oldMileage,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Mileage updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for mileage update', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Mileage update validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating Job Card mileage', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while updating the mileage.');
        }
    }

    public function updateRemarks(Request $request, $jobCard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'remarks' => 'nullable|string|max:1000',
            ], [
                'remarks.max' => 'Remarks cannot exceed 1000 characters.',
            ]);

            $oldRemarks = $jobCard->remarks;
            $jobCard->update($validated);

            Log::info('Job Card remarks updated successfully', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_remarks' => $oldRemarks,
                'new_remarks' => $jobCard->remarks,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Remarks updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for remarks update', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Job Card remarks validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating Job Card remarks', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while updating the remarks.');
        }
    }

    public function updateStatus(Request $request, $jobcard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobcard_id);

            $validated = $request->validate([
                'status' => 'required|string|in:pending,complete,cancelled',
            ], [
                'status.required' => 'Status is required.',
                'status.in' => 'Invalid status selected. Must be pending, complete, or cancelled.',
            ]);

            $oldStatus = $jobCard->status;
            $jobCard->update($validated);

            Log::info('Job Card status updated successfully', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_status' => $oldStatus,
                'new_status' => $jobCard->status,
                'user_id' => auth()->id(),
                'updated_at' => now(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('success', 'Job Card status updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for status update', [
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Job Card status validation failed', [
                'job_card_id' => $jobcard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating Job Card status', [
                'job_card_id' => $jobcard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', 'Something went wrong while updating the job card status.');
        }
    }

    public function print(JobCard $jobCard)
    {
        // Eager load all necessary relationships for the print view
        $jobCard->load([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'user', // The Service Advisor who created it
            'acTechnician',
            'electronicTechnician',
            'mechanicalTechnician',
            'jobCardVehicleServices.vehicleService',
            'jobCardVehicleServices.vehicleServiceOption',
            'jobCardProducts.stock.product',
            'jobCardCharges'
        ]);

        // Return the Blade view, passing the loaded job card data
        return view('jobcard.print', ['jobCard' => $jobCard]);
    }
}
