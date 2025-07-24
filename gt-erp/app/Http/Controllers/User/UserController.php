<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        // Fetch all users, ordered by creation date, selecting specific columns.
        // The password column is included for demonstration, but typically should not be fetched
        // unless there's a specific need (e.g., for hashing, but it's usually handled by authentication).
        $users = User::select('id', 'name', 'email', 'mobile', 'role', 'status')
            ->orderBy('created_at', 'asc')
            ->get();

        // Render the Inertia page with the users data.
        return Inertia::render('user/index', ['users' => $users]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request)
    {
        // Render the Inertia page for creating a new user.
        return Inertia::render('user/create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate the incoming request data.
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'mobile' => ['nullable', 'string', 'max:20', 'unique:users'],
                'role' => ['required', 'string', Rule::in(['cashier', 'admin', 'service-manager'])],
                'status' => ['required', 'string', Rule::in(['active', 'deactive', 'pending'])],
                'password' => ['required', 'string', 'min:8', 'confirmed'], // 'confirmed' checks for password_confirmation field
            ]);

            // Create a new User instance with the validated data.
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'mobile' => $validatedData['mobile'],
                'role' => $validatedData['role'],
                'status' => $validatedData['status'],
                'password' => Hash::make($validatedData['password']), // Hash the password before storing
            ]);

            // Log successful user creation.
            Log::info('User created successfully.', ['user_id' => $user->id, 'email' => $user->email]);

            // Redirect to the user index page with a success message.
            return redirect()->route('dashboard.user.index')->with('success', 'User registered successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors.
            Log::error('User registration validation failed.', ['errors' => $e->errors()]);
            // Redirect back with validation errors.
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Log any other unexpected errors during user creation.
            Log::error('Error creating user.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            // Redirect back with a generic error message.
            return redirect()->back()->with('error', 'Failed to register user. Please try again.')->withInput();
        }
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user) // Using Route Model Binding
    {
        // Render the Inertia page for editing a user, passing the user data.
        return Inertia::render('user/edit', ['user' => $user]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user) // Using Route Model Binding
    {
        try {
            // Validate the incoming request data.
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'mobile' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
                'role' => ['required', 'string', Rule::in(['cashier', 'admin', 'service-manager'])],
                'status' => ['required', 'string', Rule::in(['active', 'deactive', 'pending'])],
                'password' => ['nullable', 'string', 'min:8', 'confirmed'], // Password is optional for update
            ]);

            // Update user attributes.
            $user->name = $validatedData['name'];
            $user->email = $validatedData['email'];
            $user->mobile = $validatedData['mobile'];
            $user->role = $validatedData['role'];
            $user->status = $validatedData['status'];

            // If a new password is provided, hash and update it.
            if (!empty($validatedData['password'])) {
                $user->password = Hash::make($validatedData['password']);
            }

            // Save the changes to the database.
            $user->save();

            // Log successful user update.
            Log::info('User updated successfully.', ['user_id' => $user->id, 'email' => $user->email]);

            // Redirect to the user index page with a success message.
            return redirect()->route('dashboard.user.index')->with('success', 'User updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors.
            Log::error('User update validation failed.', ['user_id' => $user->id, 'errors' => $e->errors()]);
            // Redirect back with validation errors.
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Log any other unexpected errors during user update.
            Log::error('Error updating user.', ['user_id' => $user->id, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            // Redirect back with a generic error message.
            return redirect()->back()->with('error', 'Failed to update user. Please try again.')->withInput();
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user) // Using Route Model Binding
    {
        try {
            // Delete the user.
            $user->delete();

            // Log successful user deletion.
            Log::info('User deleted successfully.', ['user_id' => $user->id, 'email' => $user->email]);

            // Redirect to the user index page with a success message.
            return redirect()->route('dashboard.user.index')->with('success', 'User deleted successfully!');
        } catch (\Exception $e) {
            // Log any errors during user deletion.
            Log::error('Error deleting user.', ['user_id' => $user->id, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            // Redirect back with an error message.
            return redirect()->back()->with('error', 'Failed to delete user. Please try again.');
        }
    }
}
