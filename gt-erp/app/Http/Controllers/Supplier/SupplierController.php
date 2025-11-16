<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            // Start the query builder
            $query = Supplier::query();

            // Apply search filters
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            }

            // Apply status filter
            if ($request->has('status') && in_array($request->status, ['active', 'deactive'])) {
                $query->where('status', $request->status);
            }

            // Paginate the results with 10 rows per page
            $suppliers = $query->paginate(10)->withQueryString();

            // Return the Inertia view with the data
            return Inertia::render('supplier/index', [
                'suppliers' => $suppliers,
                'filters' => $request->only(['search', 'status']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching suppliers: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Could not fetch suppliers. Please try again later.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        try {
            return Inertia::render('supplier/create');
        } catch (\Exception $e) {
            Log::error('Error showing create form: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Could not load the create form. Please try again later.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'email', 'max:255', 'unique:suppliers,email'],
                'mobile' => ['nullable', 'string', 'max:20', 'unique:suppliers,mobile'],
                'address' => ['required', 'string'],
                'register_date' => ['required', 'date'],
                'close_date' => ['nullable', 'date'],
                'status' => ['required', 'string', Rule::in(['active', 'deactive'])],
            ]);

            Supplier::create($validatedData);

            Log::info('New supplier created successfully: ' . $validatedData['name']);
            return redirect()->route('supplier.index')->with('success', 'Supplier created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Supplier creation validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating supplier: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Supplier could not be created. Please try again later.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Supplier $supplier)
    {
        try {
            return Inertia::render('supplier/edit', [
                'supplier' => $supplier,
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing edit form: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Could not load the edit form. Please try again later.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        try {
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'email', 'max:255', Rule::unique('suppliers')->ignore($supplier->id)],
                'mobile' => ['nullable', 'string', 'max:20', Rule::unique('suppliers')->ignore($supplier->id)],
                'address' => ['required', 'string'],
                'register_date' => ['required', 'date'],
                'close_date' => ['nullable', 'date'],
                'status' => ['required', 'string', Rule::in(['active', 'deactive'])],
            ]);

            $supplier->update($validatedData);

            Log::info('Supplier updated successfully: ' . $supplier->name);
            return redirect()->route('supplier.index')->with('success', 'Supplier updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Supplier update validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating supplier: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Supplier could not be updated. Please try again later.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        try {
            $supplier->delete();

            Log::info('Supplier deleted successfully: ' . $supplier->name);
            return redirect()->route('supplier.index')->with('success', 'Supplier deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting supplier: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Supplier could not be deleted. Please try again later.');
        }
    }
}
