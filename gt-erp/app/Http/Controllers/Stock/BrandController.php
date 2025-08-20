<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Brand; // Import the Brand model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log; // Import Log facade
use Illuminate\Validation\ValidationException; // Import ValidationException

class BrandController extends Controller
{
    /**
     * Display a listing of the brands.
     */
    public function index(Request $request)
    {
        $query = Brand::query();

        // Handle search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Handle status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $brands = $query->paginate(10);

        return Inertia::render('inventory/brand/index', [
            'brands' => $brands,
            'filters' => $request->only(['search', 'status']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a newly created brand in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate the incoming request data for creating a new brand
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:brands,name', // Name is required, string, max 255 chars, must be unique in brands table
                'description' => 'nullable|string|max:1000',           // Description is optional, string, max 1000 chars
                'status' => 'required|in:active,deactive',             // Status is required, must be 'active' or 'inactive'
            ]);

            // Create a new Brand instance with the validated data
            Brand::create($validatedData);

            // Log the successful creation of the brand
            Log::info('Brand created successfully.', ['brand_name' => $validatedData['name']]);

            // Redirect to the brand index page with a success flash message
            return redirect()->route('dashboard.brand.index')->with('success', 'Brand created successfully!');
        } catch (ValidationException $e) {
            // Catch validation exceptions, log errors, and redirect back with input and errors
            Log::error('Brand creation validation failed.', ['errors' => $e->errors(), 'request' => $request->all()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Catch any other general exceptions, log the error, and redirect back with a generic error message
            Log::error('Failed to create brand.', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return redirect()->back()->with('error', 'Failed to create brand. Please try again.');
        }
    }

    /**
     * Update the specified brand in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        try {
            // Validate the incoming request data for updating an existing brand
            // The 'name' uniqueness rule is adjusted to ignore the current brand's ID
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:brands,name,' . $brand->id, // Name is required, unique except for current brand
                'description' => 'nullable|string|max:1000',                           // Description is optional
                'status' => 'required|in:active,deactive',                             // Status is required
            ]);

            // Update the existing brand instance with the validated data
            $brand->update($validatedData);

            // Log the successful update of the brand
            Log::info('Brand updated successfully.', ['brand_id' => $brand->id, 'brand_name' => $validatedData['name']]);

            // Redirect to the brand index page with a success flash message
            return redirect()->route('dashboard.brand.index')->with('success', 'Brand updated successfully!');
        } catch (ValidationException $e) {
            // Catch validation exceptions, log errors, and redirect back with input and errors
            Log::error('Brand update validation failed.', ['errors' => $e->errors(), 'brand_id' => $brand->id, 'request' => $request->all()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Catch any other general exceptions, log the error, and redirect back with a generic error message
            Log::error('Failed to update brand.', ['error' => $e->getMessage(), 'brand_id' => $brand->id, 'request' => $request->all()]);
            return redirect()->back()->with('error', 'Failed to update brand. Please try again.');
        }
    }
}
