<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'mobile', 'role', 'status', 'password')->orderBy('created_at', 'asc')->get();

        return Inertia::render('user/index', ['users' => $users]);
    }
    public function create(Request $request)
    {
        return Inertia::render('user/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('user/edit');
    }
}
