<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    /**
     * List all invoices
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['customer', 'jobCard', 'user'])
            ->orderBy('id', 'desc');

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('jobCard', fn($jq) => $jq->where('job_card_no', 'like', "%{$search}%"));
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $invoices = $query->paginate(20)->withQueryString();

        return Inertia::render('invoice/index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show create invoice form with job card selection
     */
    public function create(Request $request)
    {
        $jobCardId = $request->input('job_card_id');
        
        if (!$jobCardId) {
            return redirect()
                ->route('dashboard.job-card.index')
                ->with('error', 'Please select a job card first');
        }

        $jobCard = JobCard::with([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'jobCardVehicleServices.vehicleService',
            'jobCardVehicleServices.vehicleServiceOption',
            'jobCardProducts.stock.product',
            'jobCardCharges'
        ])->findOrFail($jobCardId);

        // Check if invoice already exists
        if ($jobCard->hasInvoice()) {
            return redirect()
                ->route('dashboard.invoice.show', $jobCard->invoice->id)
                ->with('info', 'Invoice already exists for this job card');
        }

        Log::info('Invoice creation initiated', [
            'job_card_id' => $jobCard->id,
            'user_id' => auth()->id(),
        ]);

        return Inertia::render('invoice/create', [
            'jobCard' => $jobCard,
        ]);
    }

    /**
     * Store new invoice
     */
    public function store(Request $request, JobCard $jobCard)
    {
        $validated = $request->validate([
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'advance_payment' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',
            'terms_conditions' => 'nullable|string|max:2000',
        ]);

        DB::beginTransaction();

        try {
            // Check if invoice already exists
            if ($jobCard->hasInvoice()) {
                Log::warning('Attempted to create duplicate invoice', [
                    'job_card_id' => $jobCard->id,
                    'existing_invoice_id' => $jobCard->invoice->id,
                ]);

                return redirect()
                    ->route('dashboard.invoice.show', $jobCard->invoice->id)
                    ->with('error', 'Invoice already exists for this job card');
            }

            // Generate invoice number
            $invoiceNo = 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 6, '0', STR_PAD_LEFT);

            // Calculate totals
            $servicesTotal = $jobCard->jobCardVehicleServices()
                ->where('is_included', true)
                ->sum('total');
            
            $productsTotal = $jobCard->jobCardProducts()->sum('total');
            $chargesTotal = $jobCard->jobCardCharges()->sum('total');

            // Create invoice
            $invoice = Invoice::create([
                'invoice_no' => $invoiceNo,
                'job_card_id' => $jobCard->id,
                'customer_id' => $jobCard->customer_id,
                'user_id' => auth()->id(),
                'services_total' => $servicesTotal,
                'products_total' => $productsTotal,
                'charges_total' => $chargesTotal,
                'advance_payment' => $validated['advance_payment'] ?? 0,
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'terms_conditions' => $validated['terms_conditions'] ?? null,
                'status' => 'draft',
            ]);

            // Create invoice items from services
            foreach ($jobCard->jobCardVehicleServices()->where('is_included', true)->get() as $service) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'service',
                    'job_card_vehicle_service_id' => $service->id,
                    'description' => $service->vehicleService->name . ' - ' . $service->vehicleServiceOption->name,
                    'quantity' => 1,
                    'unit_price' => $service->total,
                    'line_total' => $service->total,
                ]);
            }

            // Create invoice items from products
            foreach ($jobCard->jobCardProducts as $product) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'product',
                    'job_card_product_id' => $product->id,
                    'description' => $product->stock->product->name,
                    'quantity' => $product->quantity,
                    'unit_price' => $product->unit_price,
                    'line_total' => $product->total,
                ]);
            }

            // Create invoice items from charges
            foreach ($jobCard->jobCardCharges as $charge) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'charge',
                    'job_card_charge_id' => $charge->id,
                    'description' => $charge->name,
                    'quantity' => 1,
                    'unit_price' => $charge->total,
                    'line_total' => $charge->total,
                ]);
            }

            DB::commit();

            Log::info('Invoice created successfully', [
                'invoice_id' => $invoice->id,
                'invoice_no' => $invoice->invoice_no,
                'job_card_id' => $jobCard->id,
                'total' => $invoice->total,
                'items_count' => $invoice->items()->count(),
            ]);

            return redirect()
                ->route('dashboard.invoice.show', $invoice->id)
                ->with('success', 'Invoice created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create invoice', [
                'job_card_id' => $jobCard->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to create invoice. Please try again.')
                ->withInput();
        }
    }

    /**
     * Show invoice details
     */
    public function show(Invoice $invoice)
    {
        $invoice->load([
            'customer',
            'jobCard.vehicle.brand',
            'jobCard.vehicle.model',
            'items',
            'user'
        ]);

        Log::info('Invoice viewed', [
            'invoice_id' => $invoice->id,
            'invoice_no' => $invoice->invoice_no,
            'user_id' => auth()->id(),
        ]);

        return Inertia::render('invoice/show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Update invoice advance payment
     */
    public function updatePayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'advance_payment' => 'required|numeric|min:0|max:' . $invoice->total,
        ]);

        try {
            $oldPayment = $invoice->advance_payment;
            $invoice->update([
                'advance_payment' => $validated['advance_payment'],
            ]);

            Log::info('Invoice payment updated', [
                'invoice_id' => $invoice->id,
                'invoice_no' => $invoice->invoice_no,
                'old_payment' => $oldPayment,
                'new_payment' => $invoice->advance_payment,
                'remaining' => $invoice->remaining,
                'status' => $invoice->status,
            ]);

            return redirect()
                ->back()
                ->with('success', 'Payment updated successfully');

        } catch (\Exception $e) {
            Log::error('Failed to update invoice payment', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to update payment');
        }
    }

    /**
     * Cancel invoice
     */
    public function cancel(Invoice $invoice)
    {
        try {
            $invoice->update(['status' => 'cancelled']);

            Log::info('Invoice cancelled', [
                'invoice_id' => $invoice->id,
                'invoice_no' => $invoice->invoice_no,
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->with('success', 'Invoice cancelled successfully');

        } catch (\Exception $e) {
            Log::error('Failed to cancel invoice', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to cancel invoice');
        }
    }
}