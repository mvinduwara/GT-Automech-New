<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\JobCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            $jobCard = JobCard::findOrFail($jobCard_id);

            Log::info('Job Card returned successfully', [
                'jobCard' => $jobCard,
            ]);

            return Inertia::return('job-card/form', [
                'jobCard' => $jobCard,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found ', [
                'jobCard_id' => $jobCard_id,
            ]);

            return back()->with('error', 'Job Card not found');
        }
    }

    public function updateRemarks(Request $request, $jobCard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'remarks' => 'nullable|string|max:1000', // Added max length for better validation
            ]);

            $oldRemarks = $jobCard->remarks; // Store old remarks for logging
            $jobCard->update($validated);

            Log::info('Job Card remarks updated successfully', [
                'job_card_id' => $jobCard->id,
                'old_remarks' => $oldRemarks,
                'new_remarks' => $jobCard->remarks,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Job Card remarks updated successfully');
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

            return back()->with('error', 'Something went wrong while updating the job card remarks.');
        }
    }

    public function updateStatus(Request $request, $jobcard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobcard_id);

            $validated = $request->validate([
                'status' => 'required|string|in:pending,complete,cancelled',
            ]);

            $oldStatus = $jobCard->status; // Store old status for logging
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
