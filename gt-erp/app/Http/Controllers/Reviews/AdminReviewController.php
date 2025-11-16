<?php

namespace App\Http\Controllers\Reviews;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminReviewController extends Controller
{
    /**
     * Display a listing of all customer reviews.
     */
    public function index(Request $request)
    {
        // Eager-load the relationships from the CustomerReview model
        // We get the invoice, then the customer from the invoice
        // We also get the job card, then the vehicle from the job card
        $reviews = CustomerReview::with([
            'invoice' => function ($query) {
                $query->select('id', 'invoice_no', 'customer_id'); // Select only needed fields
            },
            'invoice.customer' => function ($query) {
                $query->select('id', 'name', 'mobile'); //
            },
            'jobCard' => function ($query) {
                $query->select('id', 'job_card_no', 'vehicle_id');
            },
            'jobCard.vehicle' => function ($query) {
                $query->select('id', 'vehicle_no'); //
            }
        ])
        ->latest() // Show newest reviews first
        ->paginate(20)
        ->withQueryString();

        return Inertia::render('review/index', [
            'reviews' => $reviews,
            'filters' => $request->all(),
        ]);
    }
}