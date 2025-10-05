<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\JobCardCharges;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class JobCardChargesController extends Controller
{
    /**
     * Store a new job card charge
     */
    public function store(Request $request, $jobcard_id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'charge' => 'required|integer|min:0',
                'discount_type' => ['nullable', Rule::in(['percentage', 'amount'])],
                'discount_value' => 'nullable|numeric|min:0|max:999999999.99',
            ]);

            // Additional validation for discount percentage
            if (isset($validated['discount_type']) && $validated['discount_type'] === 'percentage') {
                if (($validated['discount_value'] ?? 0) > 100) {
                    return back()->withErrors([
                        'discount_value' => 'Percentage discount cannot exceed 100%'
                    ]);
                }
            }

            // Additional validation for discount amount
            if (isset($validated['discount_type']) && $validated['discount_type'] === 'amount') {
                if (($validated['discount_value'] ?? 0) > $validated['charge']) {
                    return back()->withErrors([
                        'discount_value' => 'Discount amount cannot exceed the charge amount'
                    ]);
                }
            }

            $charge = JobCardCharges::create([
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'name' => $validated['name'],
                'charge' => $validated['charge'],
                'discount_type' => $validated['discount_type'] ?? null,
                'discount_value' => $validated['discount_value'] ?? 0,
            ]);

            Log::info('Job card charge created successfully', [
                'charge_id' => $charge->id,
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'name' => $charge->name,
                'charge' => $charge->charge,
                'discount_type' => $charge->discount_type,
                'discount_value' => $charge->discount_value,
                'total' => $charge->total,
            ]);

            // Return JSON response with charge data for AJAX requests
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Charge added successfully',
                    'charge' => $charge,
                ], 201);
            }

            return back()->with('success', 'Charge added successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Job card charge validation failed', [
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'errors' => $e->errors(),
                'input' => $request->except(['password']),
            ]);
            throw $e;

        } catch (\Exception $e) {
            Log::error('Failed to create job card charge', [
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to add charge. Please try again.'
            ]);
        }
    }

    /**
     * Update an existing job card charge
     */
    public function update(Request $request, $id)
    {
        try {
            $charge = JobCardCharges::findOrFail($id);

            // Store old values for logging
            $oldValues = [
                'name' => $charge->name,
                'charge' => $charge->charge,
                'discount_type' => $charge->discount_type,
                'discount_value' => $charge->discount_value,
                'total' => $charge->total,
            ];

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'charge' => 'required|integer|min:0',
                'discount_type' => ['nullable', Rule::in(['percentage', 'amount'])],
                'discount_value' => 'nullable|numeric|min:0|max:999999999.99',
            ]);

            // Additional validation for discount percentage
            if (isset($validated['discount_type']) && $validated['discount_type'] === 'percentage') {
                if (($validated['discount_value'] ?? 0) > 100) {
                    return back()->withErrors([
                        'discount_value' => 'Percentage discount cannot exceed 100%'
                    ]);
                }
            }

            // Additional validation for discount amount
            if (isset($validated['discount_type']) && $validated['discount_type'] === 'amount') {
                if (($validated['discount_value'] ?? 0) > $validated['charge']) {
                    return back()->withErrors([
                        'discount_value' => 'Discount amount cannot exceed the charge amount'
                    ]);
                }
            }

            $charge->update([
                'name' => $validated['name'],
                'charge' => $validated['charge'],
                'discount_type' => $validated['discount_type'] ?? null,
                'discount_value' => $validated['discount_value'] ?? 0,
            ]);

            Log::info('Job card charge updated successfully', [
                'charge_id' => $charge->id,
                'job_card_id' => $charge->job_card_id,
                'user_id' => auth()->id(),
                'old_values' => $oldValues,
                'new_values' => [
                    'name' => $charge->name,
                    'charge' => $charge->charge,
                    'discount_type' => $charge->discount_type,
                    'discount_value' => $charge->discount_value,
                    'total' => $charge->total,
                ],
            ]);

            return back()->with('success', 'Charge updated successfully');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job card charge not found for update', [
                'charge_id' => $id,
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors([
                'error' => 'Charge not found'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Job card charge update validation failed', [
                'charge_id' => $id,
                'user_id' => auth()->id(),
                'errors' => $e->errors(),
                'input' => $request->except(['password']),
            ]);
            throw $e;

        } catch (\Exception $e) {
            Log::error('Failed to update job card charge', [
                'charge_id' => $id,
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to update charge. Please try again.'
            ]);
        }
    }

    /**
     * Delete a job card charge
     */
    public function destroy($id)
    {
        try {
            $charge = JobCardCharges::findOrFail($id);
            
            // Store charge data before deletion for logging
            $chargeData = [
                'charge_id' => $charge->id,
                'job_card_id' => $charge->job_card_id,
                'name' => $charge->name,
                'charge' => $charge->charge,
                'discount_type' => $charge->discount_type,
                'discount_value' => $charge->discount_value,
                'total' => $charge->total,
                'deleted_by' => auth()->id(),
                'deleted_at' => now(),
            ];

            $charge->delete();

            Log::info('Job card charge deleted successfully', $chargeData);

            return back()->with('success', 'Charge deleted successfully');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job card charge not found for deletion', [
                'charge_id' => $id,
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors([
                'error' => 'Charge not found'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete job card charge', [
                'charge_id' => $id,
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to delete charge. Please try again.'
            ]);
        }
    }
}