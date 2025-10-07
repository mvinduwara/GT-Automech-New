<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\JobCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobCardEmployeeController extends Controller
{
    public function searchEmployees(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:1'
        ]);

        $mobile = $request->input('q');

        $employees = Employee::with('department')
            ->where('status', 'active')
            ->where(function ($query) use ($mobile) {
                $query->where('mobile', 'LIKE', '%' . $mobile . '%')
                    ->orWhere('first_name', 'LIKE', '%' . $mobile . '%')
                    ->orWhere('last_name', 'LIKE', '%' . $mobile . '%');
            })
            ->orderBy('first_name')
            ->limit(20)
            ->get(['id', 'first_name', 'last_name', 'mobile', 'job_title', 'department_id']);

        return response()->json($employees);
    }

    public function assignEmployees(Request $request, JobCard $jobCard)
    {
        $request->validate([
            'ac' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('status', 'active')],
            'electronic' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('status', 'active')],
            'mechanical' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('status', 'active')],
        ]);

        $jobCard->update([
            'ac' => $request->input('ac') ?: null,
            'electronic' => $request->input('electronic') ?: null,
            'mechanical' => $request->input('mechanical') ?: null,
        ]);

        return back()->with('success', 'Technicians assigned successfully.');
    }

    /**
     * Get service job card with assigned technicians for display
     */
    public function show(JobCard $jobCard)
    {
        $jobCard->load([
            'acTechnician.department',
            'electronicTechnician.department',
            'mechanicalTechnician.department',
        ]);

        return response()->json($jobCard);
    }
}
