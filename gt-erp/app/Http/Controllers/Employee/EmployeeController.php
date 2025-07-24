<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Employee::with('department:id,name')
                ->select('id', 'first_name', 'last_name', 'email', 'mobile', 'job_title', 'department_id', 'status')
                ->orderBy('created_at', 'asc');

            // Search functionality
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                        ->orWhere('last_name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhere('mobile', 'like', '%' . $search . '%');
                });
            }

            // Filter by department
            if ($department_id = $request->query('department')) {
                $query->where('department_id', $department_id);
            }

            // Filter by status
            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }

            $employees = $query->paginate(10)->withQueryString(); // 10 employees per page

            $departments = Department::select('id', 'name')->get();

            return Inertia::render('employee/index', [
                'employees' => $employees,
                'departments' => $departments,
                'success' => session('success'),
                'error' => session('error'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch employees: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return Inertia::render('employee/index', [
                'employees' => [],
                'departments' => Department::select('id', 'name')->get(),
                'error' => 'Failed to load employees. Please try again.',
            ]);
        }
    }


    public function create()
    {
        try {
            $departments = Department::select('id', 'name')->get();
            return Inertia::render('employee/create', [
                'departments' => $departments,
                'success' => session('success'),
                'error' => session('error'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load employee creation page: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Failed to load creation form.');
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'nullable|email|unique:employees,email',
                'mobile' => 'required|string|max:20',
                'hire_date' => 'required|date',
                'job_title' => 'required|string|max:255',
                'department_id' => 'nullable|exists:departments,id',
                'status' => 'required|string|in:active,deactive,pending,terminated',
            ]);

            Employee::create($validated);

            Log::info('Employee Registered Successfully', ['email' => $validated['email']]);

            return redirect()->route('dashboard.employee.index')->with('success', 'Employee Registered Successfully!');
        } catch (ValidationException $e) {
            Log::warning('Employee registration validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Employee registration failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Something went wrong, please try again.')->withInput();
        }
    }

    public function edit(Request $request, $employee_id)
    {
        try {
            $employee = Employee::with('department:id,name')->findOrFail($employee_id);
            $departments = Department::select('id', 'name')->get();

            return Inertia::render('employee/edit', [
                'employee' => $employee,
                'departments' => $departments,
                'success' => session('success'),
                'error' => session('error'),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Employee not found for editing: ' . $employee_id, ['message' => $e->getMessage()]);
            return redirect()->route('dashboard.employee.index')->with('error', 'Employee not found.');
        } catch (\Exception $e) {
            Log::error('Failed to load employee edit page: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Failed to load edit form.');
        }
    }

    public function update(Request $request, $employee_id)
    {
        try {
            $employee = Employee::findOrFail($employee_id);

            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:employees,email,' . $employee->id,
                'mobile' => 'required|string|max:20',
                'hire_date' => 'required|date',
                'job_title' => 'required|string|max:255',
                'department_id' => 'nullable|exists:departments,id',
                'status' => 'required|string|in:active,deactive,pending,terminated',
            ]);

            $employee->update($validated);

            Log::info('Employee Updated Successfully', ['email' => $validated['email'], 'id' => $employee->id]);

            return redirect()->route('dashboard.employee.index')->with('success', 'Employee Updated Successfully!');
        } catch (ValidationException $e) {
            Log::warning('Employee update validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
                'employee_id' => $employee_id,
            ]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Employee not found for update: ' . $employee_id, ['message' => $e->getMessage()]);
            return redirect()->route('dashboard.employee.index')->with('error', 'Employee not found.');
        } catch (\Exception $e) {
            Log::error('Employee update failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'employee_id' => $employee_id,
            ]);
            return redirect()->back()->with('error', 'Something went wrong, please try again.')->withInput();
        }
    }
}
