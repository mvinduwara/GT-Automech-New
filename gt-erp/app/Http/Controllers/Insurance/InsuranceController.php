<?php

namespace App\Http\Controllers\Insurance;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Models\InsuranceItem;
use App\Models\JobCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InsuranceController extends Controller
{
    /**
     * Store a newly created insurance report from job card
     */
    public function store(Request $request, JobCard $jobCard)
    {
        // Validate that job card is of type insurance
        if ($jobCard->type !== 'insurance') {
            return back()->withErrors(['error' => 'This job card is not an insurance type.']);
        }

        // Check if insurance already exists for this job card
        if ($jobCard->insurance()->exists()) {
            return back()->withErrors(['error' => 'Insurance report already exists for this job card.']);
        }

        $validated = $request->validate([
            'claim_date' => 'nullable|date',
            'insurance_company' => 'required|string|max:255',
            'policy_number' => 'required|string|max:255',
            'claim_number' => 'nullable|string|max:255',
            'accident_date' => 'nullable|date',
            'accident_location' => 'nullable|string|max:500',
            'accident_description' => 'nullable|string',
            'damage_assessment' => 'nullable|string',
            'excess_amount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Calculate estimated cost from job card totals
            $servicesTotal = $jobCard->jobCardVehicleServices()
                ->where('is_included', true)
                ->sum('total');
            $productsTotal = $jobCard->jobCardProducts()->sum('total');
            $chargesTotal = $jobCard->jobCardCharges()->sum('total');
            $estimatedCost = $servicesTotal + $productsTotal + $chargesTotal;

            // Create insurance record
            $insurance = Insurance::create([
                'job_card_id' => $jobCard->id,
                'customer_id' => $jobCard->customer_id,
                'vehicle_id' => $jobCard->vehicle_id,
                'user_id' => Auth::id(),
                'insurance_company' => $validated['insurance_company'],
                'policy_number' => $validated['policy_number'],
                'claim_date' => $validated['claim_date'] ?? now(),
                'claim_number' => $validated['claim_number'] ?? null,
                'accident_description' => $validated['accident_description'] ?? null,
                'accident_date' => $validated['accident_date'] ?? null,
                'accident_location' => $validated['accident_location'] ?? null,
                'damage_assessment' => $validated['damage_assessment'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'estimated_cost' => $estimatedCost,
                'excess_amount' => $validated['excess_amount'] ?? 0,
                'status' => 'pending',
            ]);

            // Copy services to insurance items
            foreach ($jobCard->jobCardVehicleServices()->where('is_included', true)->get() as $service) {
                InsuranceItem::create([
                    'insurance_id' => $insurance->id,
                    'item_type' => 'service',
                    'job_card_vehicle_service_id' => $service->id,
                    'item_name' => $service->vehicleService->name . ' - ' . $service->vehicleServiceOption->name,
                    'description' => 'Service: ' . $service->vehicleService->name,
                    'quantity' => 1,
                    'unit_price' => $service->subtotal,
                    'subtotal' => $service->subtotal,
                    'discount_type' => $service->discount_type,
                    'discount_value' => $service->discount_value ?? 0,
                    'total' => $service->total,
                    'is_approved' => false,
                ]);
            }

            // Copy products to insurance items
            foreach ($jobCard->jobCardProducts as $product) {
                InsuranceItem::create([
                    'insurance_id' => $insurance->id,
                    'item_type' => 'product',
                    'job_card_product_id' => $product->id,
                    'item_name' => $product->stock->product->name,
                    'description' => 'Part Number: ' . $product->stock->product->part_number,
                    'quantity' => $product->quantity,
                    'unit_price' => $product->unit_price,
                    'subtotal' => $product->subtotal,
                    'discount_type' => $product->discount_type,
                    'discount_value' => $product->discount_value ?? 0,
                    'total' => $product->total,
                    'is_approved' => false,
                ]);
            }

            // Copy charges to insurance items
            foreach ($jobCard->jobCardCharges as $charge) {
                InsuranceItem::create([
                    'insurance_id' => $insurance->id,
                    'item_type' => 'charge',
                    'job_card_charge_id' => $charge->id,
                    'item_name' => $charge->name,
                    'description' => 'Additional Charge',
                    'quantity' => 1,
                    'unit_price' => $charge->charge,
                    'subtotal' => $charge->charge,
                    'discount_type' => $charge->discount_type,
                    'discount_value' => $charge->discount_value ?? 0,
                    'total' => $charge->total,
                    'is_approved' => false,
                ]);
            }

            DB::commit();

            return redirect()->route('dashboard.insurance.show', $insurance->id)
                ->with('success', 'Insurance report created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create insurance report: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified insurance report
     */
    public function show(Insurance $insurance)
    {
        $insurance->load([
            'jobCard',
            'jobCard.vehicle.brand',
            'jobCard.vehicle.model',
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'items',
            'user',
        ]);

        return Inertia::render('insurance/show', [
            'insurance' => $insurance,
        ]);
    }

    /**
     * Update the specified insurance report
     */
    public function update(Request $request, Insurance $insurance)
    {
        $validated = $request->validate([
            'insurance_company' => 'nullable|string|max:255',
            'policy_number' => 'nullable|string|max:255',
            'claim_date' => 'nullable|date',
            'claim_number' => 'nullable|string|max:255',
            'accident_date' => 'nullable|date',
            'accident_location' => 'nullable|string|max:500',
            'accident_description' => 'nullable|string',
            'damage_assessment' => 'nullable|string',
            'excess_amount' => 'nullable|numeric|min:0',
            'approved_amount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
            'status' => 'nullable|in:pending,submitted,approved,rejected,completed',
        ]);

        $insurance->update($validated);

        return back()->with('success', 'Insurance report updated successfully.');
    }
}
