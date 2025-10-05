<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\JobCard;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Str;

class JobCardController extends Controller
{
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
                'user'
            ])->findOrFail($jobCard_id);

            Log::info('Job Card form accessed', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'user_id' => auth()->id(),
            ]);

            return Inertia::render('job-card/form', [
                'jobCard' => $jobCard,
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

    public function updateCustomer(Request $request, $jobCard_id)
    {
        DB::beginTransaction();
        
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'title' => 'required|string|in:Mr,Mrs,Ms,Dr',
                'name' => 'required|string|max:255',
                'mobile' => [
                    'required',
                    'string',
                    'regex:/^[0-9+\-\s()]+$/',
                    'min:10',
                    'max:15'
                ],
                'address' => 'required|string|max:500',
            ], [
                'customer_id.required' => 'Customer ID is required.',
                'customer_id.exists' => 'Selected customer does not exist.',
                'title.required' => 'Title is required.',
                'title.in' => 'Invalid title selected.',
                'name.required' => 'Customer name is required.',
                'name.max' => 'Customer name cannot exceed 255 characters.',
                'mobile.required' => 'Mobile number is required.',
                'mobile.regex' => 'Invalid mobile number format.',
                'mobile.min' => 'Mobile number must be at least 10 characters.',
                'mobile.max' => 'Mobile number cannot exceed 15 characters.',
                'address.required' => 'Address is required.',
                'address.max' => 'Address cannot exceed 500 characters.',
            ]);

            // Update customer information
            $customer = Customer::findOrFail($validated['customer_id']);
            $oldCustomerData = $customer->toArray();
            
            $customer->update([
                'title' => $validated['title'],
                'name' => $validated['name'],
                'mobile' => $validated['mobile'],
                'address' => $validated['address'],
            ]);

            DB::commit();

            Log::info('Customer updated successfully via Job Card', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'customer_id' => $customer->id,
                'old_data' => $oldCustomerData,
                'new_data' => $customer->fresh()->toArray(),
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Customer information updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            
            Log::warning('Job Card or Customer not found for update', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card or Customer not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            Log::warning('Customer update validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->except(['password']),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error updating customer via Job Card', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->except(['password']),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while updating customer information.');
        }
    }

    public function updateVehicle(Request $request, $jobCard_id)
    {
        DB::beginTransaction();
        
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'vehicle_id' => 'required|exists:vehicles,id',
                'vehicle_no' => [
                    'required',
                    'string',
                    'max:20',
                    'regex:/^[A-Z0-9\-]+$/',
                    Rule::unique('vehicles', 'vehicle_no')->ignore($request->vehicle_id),
                ],
                'make_year' => [
                    'required',
                    'string',
                    'digits:4',
                    'integer',
                    'min:1900',
                    'max:' . (date('Y') + 1),
                ],
            ], [
                'vehicle_id.required' => 'Vehicle ID is required.',
                'vehicle_id.exists' => 'Selected vehicle does not exist.',
                'vehicle_no.required' => 'Vehicle number is required.',
                'vehicle_no.max' => 'Vehicle number cannot exceed 20 characters.',
                'vehicle_no.regex' => 'Vehicle number must contain only uppercase letters, numbers, and hyphens.',
                'vehicle_no.unique' => 'This vehicle number is already registered.',
                'make_year.required' => 'Make year is required.',
                'make_year.digits' => 'Make year must be 4 digits.',
                'make_year.integer' => 'Make year must be a valid year.',
                'make_year.min' => 'Make year cannot be before 1900.',
                'make_year.max' => 'Make year cannot be in the future.',
            ]);

            // Update vehicle information
            $vehicle = Vehicle::findOrFail($validated['vehicle_id']);
            $oldVehicleData = $vehicle->toArray();
            
            $vehicle->update([
                'vehicle_no' => strtoupper($validated['vehicle_no']),
                'make_year' => $validated['make_year'],
            ]);

            DB::commit();

            Log::info('Vehicle updated successfully via Job Card', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'vehicle_id' => $vehicle->id,
                'old_data' => $oldVehicleData,
                'new_data' => $vehicle->fresh()->toArray(),
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Vehicle information updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            
            Log::warning('Job Card or Vehicle not found for update', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card or Vehicle not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            Log::warning('Vehicle update validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error updating vehicle via Job Card', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while updating vehicle information.');
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
}