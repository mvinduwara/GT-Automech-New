<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
