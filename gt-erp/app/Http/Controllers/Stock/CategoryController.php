<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Category; // Import the Category model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log; // Import Log facade
use Illuminate\Validation\ValidationException; // Import ValidationException

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        // Start a new query builder instance for the Category model
        $query = Category::query();

        // Handle search functionality: filter categories by name if a search term is provided
        if ($search = $request->input('search')) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Handle pagination: retrieve paginated results, 10 items per page
        $categories = $query->paginate(10);

        // Render the Inertia page for categories index
        return Inertia::render('inventory/category/index', [
            'categories' => $categories, // Pass the paginated categories data to the frontend
            'filters' => $request->only(['search']), // Pass current search filter back to maintain state
            'flash' => [
                'success' => session('success'), // Retrieve success message from session
                'error' => session('error'),   // Retrieve error message from session
            ],
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate the incoming request data for creating a new category
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name', // Name is required, string, max 255 chars, must be unique in categories table
                'description' => 'nullable|string|max:1000',           // Description is optional, string, max 1000 chars
                'status' => 'required|in:active,deactive',             // Status is required, must be 'active' or 'inactive'
            ]);

            // Create a new Category instance with the validated data
            Category::create($validatedData);

            // Log the successful creation of the category
            Log::info('Category created successfully.', ['category_name' => $validatedData['name']]);

            // Redirect to the category index page with a success flash message
            return redirect()->route('dashboard.category.index')->with('success', 'Category created successfully!');

        } catch (ValidationException $e) {
            // Catch validation exceptions, log errors, and redirect back with input and errors
            Log::error('Category creation validation failed.', ['errors' => $e->errors(), 'request' => $request->all()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Catch any other general exceptions, log the error, and redirect back with a generic error message
            Log::error('Failed to create category.', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return redirect()->back()->with('error', 'Failed to create category. Please try again.');
        }
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        try {
            // Validate the incoming request data for updating an existing category
            // The 'name' uniqueness rule is adjusted to ignore the current category's ID
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id, // Name is required, unique except for current category
                'description' => 'nullable|string|max:1000',                           // Description is optional
                'status' => 'required|in:active,deactive',                             // Status is required
            ]);

            // Update the existing category instance with the validated data
            $category->update($validatedData);

            // Log the successful update of the category
            Log::info('Category updated successfully.', ['category_id' => $category->id, 'category_name' => $validatedData['name']]);

            // Redirect to the category index page with a success flash message
            return redirect()->route('dashboard.category.index')->with('success', 'Category updated successfully!');

        } catch (ValidationException $e) {
            // Catch validation exceptions, log errors, and redirect back with input and errors
            Log::error('Category update validation failed.', ['errors' => $e->errors(), 'category_id' => $category->id, 'request' => $request->all()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Catch any other general exceptions, log the error, and redirect back with a generic error message
            Log::error('Failed to update category.', ['error' => $e->getMessage(), 'category_id' => $category->id, 'request' => $request->all()]);
            return redirect()->back()->with('error', 'Failed to update category. Please try again.');
        }
    }
}
