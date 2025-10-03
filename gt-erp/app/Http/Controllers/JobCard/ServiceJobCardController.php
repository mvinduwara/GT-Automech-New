<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\ServiceJobCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceJobCardController extends Controller
{
    public function searchEmployees(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => 'required|string|min:1'
        ]);

        $mobile = $request->input('mobile');

        $employees = Employee::with('department')
            ->where('mobile', 'LIKE', '%' . $mobile . '%')
            ->where('status', 'active') // Assuming you have a status field - remove if not applicable
            ->orderBy('first_name')
            ->limit(20) // Limit results to prevent too many options
            ->get(['id', 'first_name', 'last_name', 'mobile', 'job_title', 'department_id']);

        return response()->json($employees);
    }

    /**
     * Assign employees to service job card technician roles
     */
    public function assignEmployees(Request $request, ServiceJobCard $serviceJobCard)
    {
        $request->validate([
            'ac' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('status', 'active')],
            'electronic' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('status', 'active')],
            'mechanical' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('status', 'active')],
        ]);

        // Update the service job card with new technician assignments
        $serviceJobCard->update([
            'ac' => $request->input('ac') ?: null,
            'electronic' => $request->input('electronic') ?: null,
            'mechanical' => $request->input('mechanical') ?: null,
        ]);

        return back()->with('success', 'Technicians assigned successfully.');
    }

    /**
     * Get service job card with assigned technicians for display
     */
    public function show(ServiceJobCard $serviceJobCard)
    {
        $serviceJobCard->load([
            'acTechnician',
            'electronicTechnician',
            'mechanicalTechnician',
            'jobCard'
        ]);

        return response()->json($serviceJobCard);
    }
}
