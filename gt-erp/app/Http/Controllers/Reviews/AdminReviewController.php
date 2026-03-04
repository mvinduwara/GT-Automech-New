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
    private function getCallsQuery(Request $request)
    {
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

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

        if ($dateFrom) {
            $query->whereDate('invoice_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('invoice_date', '<=', $dateTo);
        }

        if ($request->input('filter') === 'completed') {
            $query->whereNotNull('manual_rating');
        } else {
            $query->whereNull('manual_rating');
        }

        return $query;
    }

    private function getReviewsQuery(Request $request)
    {
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = CustomerReview::with([
            'invoice:id,invoice_no,customer_id',
            'invoice.customer:id,name,mobile',
            'jobCard:id,job_card_no,vehicle_id',
            'jobCard.vehicle:id,vehicle_no'
        ])->latest();

        if ($search) {
            $query->whereHas('invoice', function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $view = $request->input('view', 'reviews');

        if ($view === 'calls') {
            $data = $this->getCallsQuery($request)->paginate(20)->withQueryString();
        } else {
            $data = $this->getReviewsQuery($request)->paginate(20)->withQueryString();
        }

        return Inertia::render('review/index', [
            'listData' => $data,
            'filters' => $request->all(),
            'currentView' => $view,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $view = $request->input('view', 'reviews');

        if ($view === 'calls') {
            $records = $this->getCallsQuery($request)->get();
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.calls', compact('records'))
                ->setPaper('a4', 'landscape');
            return $pdf->download('call-list-export.pdf');
        } else {
            $records = $this->getReviewsQuery($request)->get();
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.reviews', compact('records'))
                ->setPaper('a4', 'portrait');
            return $pdf->download('reviews-export.pdf');
        }
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