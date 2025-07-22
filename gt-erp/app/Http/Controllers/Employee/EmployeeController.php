<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employee = Employee::with('department:id,name') // Eager load only id & name
            ->select('id', 'first_name', 'last_name', 'email', 'mobile', 'job_title', 'department_id', 'status')
            ->orderBy('created_at', 'asc')
            ->get();
        return Inertia::render('employee/index', ['employee' => $employee]);
    }

    public function store(Request $request)
    {
        try {
            // Validate input data
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:employees,email',
                'mobile' => 'required|string',
                'hire_date' => 'required',
                'job_title' => 'required|string',
                'department_id' => 'nullable|integer',
                'status' => 'required|string',
            ]);

            // Create employee record
            Employee::create($validated);

            Log::info('Employee Registered Successfully', ['email' => $validated['email']]);

            // On success, redirect with success message
            return redirect('/dashboard/employee')->with('success', 'Employee Registered Successfully!');
        } catch (ValidationException $e) {
            // Validation errors
            Log::warning('Employee registration validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);

            // If request expects JSON (e.g., from AJAX), return JSON errors
            if ($request->expectsJson()) {
                return response()->json(['errors' => $e->errors()], 422);
            }

            // Otherwise, redirect back with errors and old input
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('Employee registration failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return generic error response
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Something went wrong, please try again.'], 500);
            }

            return redirect()->back()->with('error', 'Something went wrong, please try again.')->withInput();
        }
    }

    public function create(Request $request)
    {
        return Inertia::render('employee/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('employee/edit');
    }
}
