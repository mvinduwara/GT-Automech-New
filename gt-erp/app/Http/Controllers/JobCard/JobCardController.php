<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobCardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('job-card/index');
    }
    public function create(Request $request)
    {
        return Inertia::render('job-card/create');
    }
    public function edit(Request $request)
    {
        return Inertia::render('job-card/edit');
    }
}
