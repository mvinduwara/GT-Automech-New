<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $customers = Customer::query()
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                })
                ->paginate(10)
                ->withQueryString()
                ->through(fn($customer) => [
                    'id' => $customer->id,
                    'title' => $customer->title,
                    'name' => $customer->name,
                    'mobile' => $customer->mobile,
                    'address' => $customer->address,
                ]);

            return Inertia::render('customer/index', [
                'customers' => $customers,
                'filters' => $request->only(['search']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching customers: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load customers.');
        }
    }
    
    public function create(Request $request)
    {
        return Inertia::render('customer/create');
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'nullable|string|max:255',
                'name' => 'required|string|max:255',
                'mobile' => 'required|string|unique:customers|max:255',
                'address' => 'required|string',
            ]);

            Customer::create($validatedData);

            Log::info('Customer created successfully.');
            return redirect()->route('dashboard.customer.index')->with('success', 'Customer created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error when creating customer: ' . $e->getMessage());
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating customer: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create customer.');
        }
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('customer/edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'nullable|string|max:255',
                'name' => 'required|string|max:255',
                'mobile' => 'required|string|unique:customers,mobile,' . $customer->id . '|max:255',
                'address' => 'required|string',
            ]);

            $customer->update($validatedData);

            Log::info('Customer updated successfully.');
            return redirect()->route('dashboard.customer.index')->with('success', 'Customer updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error when updating customer: ' . $e->getMessage());
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating customer: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update customer.');
        }
    }

    public function destroy(Customer $customer)
    {
        try {
            $customer->delete();
            Log::info('Customer deleted successfully.');
            return redirect()->route('dashboard.customer.index')->with('success', 'Customer deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting customer: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete customer.');
        }
    }

    public function search(Request $request)
    {
        try {
            $request->validate([
                'mobile' => 'required|string|min:3|max:255',
            ]);

            $query = $request->query('mobile');
            $searchTerm = '%' . trim($query) . '%';

            $customers = Customer::select(
                'id',
                'title',
                'name',
                'mobile',
                'address'
            )
                ->where('mobile', 'like', $searchTerm)
                ->take(10)
                ->get();

            $message = $customers->isEmpty() ? 'No customers found.' : 'customers retrieved successfully.';

            return response()->json([
                'message' => $message,
                'data' => $customers->map(function ($customer) {
                    return [
                        'id' => $customer->id,
                        'title' => $customer->title,
                        'name' => $customer->name,
                        'mobile' => $customer->mobile,
                        'address' => $customer->address,
                    ];
                })->toArray(),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in searchCustomer: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while searching for customers.',
                'data' => [],
            ], 500);
        }
    }
}
