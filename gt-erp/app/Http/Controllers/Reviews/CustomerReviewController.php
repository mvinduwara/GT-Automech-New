<?php

namespace App\Http\Controllers\Reviews;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CustomerReview;
use App\Models\Invoice;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerReviewController extends Controller
{
    public function show(string $token)
    {
        $invoice = Invoice::where('review_token', $token)
            ->with(['customer', 'jobCard.vehicle'])
            ->first();

        if (!$invoice) {
            abort(404, 'Review link not found or invalid.');
        }

        if ($invoice->review()->exists()) {
            return Inertia::render('review/thank-you', [
                'message' => 'You have already submitted a review for this service.'
            ]);
        }

        return Inertia::render('review/create', [
            'invoice' => $invoice
        ]);
    }

    /**
     * Store the new review.
     */
    public function store(Request $request, string $token)
    {
        $invoice = Invoice::where('review_token', $token)->firstOrFail();

        if ($invoice->review()->exists()) {
            return redirect()->back()->with('error', 'Review already submitted.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'suggestions' => 'nullable|string|max:2000',
        ]);

        try {
            CustomerReview::create([
                'invoice_id' => $invoice->id,
                'job_card_id' => $invoice->job_card_id,
                'rating' => $validated['rating'],
                'suggestions' => $validated['suggestions'],
            ]);

            Log::info('New customer review submitted', [
                'invoice_id' => $invoice->id,
                'rating' => $validated['rating']
            ]);

            return Inertia::render('review/thank-you', [
                'message' => 'Thank you for your valuable feedback!'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store customer review', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to submit review. Please try again.');
        }
    }
}
