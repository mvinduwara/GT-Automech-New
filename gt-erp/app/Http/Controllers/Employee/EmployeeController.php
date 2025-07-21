<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
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
    public function create(Request $request)
    {
        return Inertia::render('employee/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('employee/edit');
    }
}
