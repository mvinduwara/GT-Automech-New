<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OpenJobCardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('job-card/open');
    }
    public function invoice(Request $request)
    {
        return Inertia::render('job-card/invoice');
    }
}
