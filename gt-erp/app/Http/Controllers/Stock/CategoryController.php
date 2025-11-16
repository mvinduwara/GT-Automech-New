<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Search by name and description
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        $query->orderBy('created_at', 'desc');

        $categories = $query->paginate(10)->withQueryString();

        return Inertia::render('inventory/category/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string|max:1000',
                'status' => 'required|in:active,deactive',
            ]);

            Category::create($validatedData);

            Log::info('Category created successfully.', ['category_name' => $validatedData['name']]);

            return redirect()->route('dashboard.category.index')
                ->with('success', 'Category created successfully!');
        } catch (ValidationException $e) {
            Log::error('Category creation validation failed.', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create category.', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return redirect()->back()->with('error', 'Failed to create category. Please try again.');
        }
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
                'description' => 'nullable|string|max:1000',
                'status' => 'required|in:active,deactive',
            ]);

            $category->update($validatedData);

            Log::info('Category updated successfully.', [
                'category_id' => $category->id,
                'category_name' => $validatedData['name']
            ]);

            return redirect()->route('dashboard.category.index')
                ->with('success', 'Category updated successfully!');
        } catch (ValidationException $e) {
            Log::error('Category update validation failed.', [
                'errors' => $e->errors(),
                'category_id' => $category->id,
                'request' => $request->all()
            ]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to update category.', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'request' => $request->all()
            ]);
            return redirect()->back()->with('error', 'Failed to update category. Please try again.');
        }
    }
}
