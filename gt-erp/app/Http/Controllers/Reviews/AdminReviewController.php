<?php

namespace App\Http\Controllers\Reviews;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminReviewController extends Controller
{
    public function index(Request $request)
    {
        $view = $request->input('view', 'reviews'); // Default to 'reviews'
        $search = $request->input('search');

        if ($view === 'calls') {
            // --- LOGIC FOR PENDING CALLS (INVOICES) ---
            $query = Invoice::query()
                ->with(['customer', 'jobCard.vehicle'])
                ->whereIn('status', ['paid', 'partial', 'unpaid'])
                ->where('status', '!=', 'cancelled')
                ->latest('invoice_date');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_no', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('mobile', 'like', "%{$search}%"))
                        ->orWhereHas('jobCard.vehicle', fn($v) => $v->where('vehicle_no', 'like', "%{$search}%"));
                });
            }
            
            // Optional: Filter for completed manual reviews vs pending
            if ($request->input('filter') === 'completed') {
                 $query->whereNotNull('manual_rating');
            } else {
                 $query->whereNull('manual_rating');
            }

            $data = $query->paginate(20)->withQueryString();

        } else {
            // --- LOGIC FOR SUBMITTED REVIEWS (CUSTOMER REVIEWS) ---
            $query = CustomerReview::with([
                'invoice:id,invoice_no,customer_id',
                'invoice.customer:id,name,mobile',
                'jobCard:id,job_card_no,vehicle_id',
                'jobCard.vehicle:id,vehicle_no'
            ])->latest();

            // Note: Search logic for reviews is slightly different because data is in relationships
            if ($search) {
                $query->whereHas('invoice', function($q) use ($search) {
                    $q->where('invoice_no', 'like', "%{$search}%")
                      ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
                });
            }

            $data = $query->paginate(20)->withQueryString();
        }

        return Inertia::render('review/index', [
            'listData' => $data, // Generic name 'listData' because it changes based on view
            'filters' => $request->all(),
            'currentView' => $view, // To set the active tab in frontend
        ]);
    }

    public function storeManual(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'manual_rating' => 'nullable|integer|min:1|max:5',
            'manual_feedback' => 'nullable|string|max:1000',
        ]);

        try {
            $invoice->update([
                'manual_rating' => $validated['manual_rating'],
                'manual_feedback' => $validated['manual_feedback'],
            ]);

            return redirect()->back()->with('success', 'Feedback logged successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to log manual review', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to save feedback.');
        }
    }
}