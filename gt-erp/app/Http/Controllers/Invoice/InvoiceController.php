<?php

namespace App\Http\Controllers\Invoice;

use App\Actions\Finance\CreateLedgerEntries;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Stock;
use App\Models\VehicleService;
use App\Models\VehicleServiceOption;
use App\Traits\SendsSms; // 1. Import the Trait
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    use SendsSms; // 2. Use the Trait

    /**
     * List all invoices
     */
    public function index(Request $request)
    {

        // 1. Determine Date Range for Stats
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Base query for stats
        $statsQuery = Invoice::query();

        if ($dateFrom || $dateTo) {
            // If filters are applied, use the filter range
            if ($dateFrom) {
                $statsQuery->whereDate('invoice_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $statsQuery->whereDate('invoice_date', '<=', $dateTo);
            }
        } else {
            // Default to Today if no date filters are set
            $statsQuery->whereDate('invoice_date', Carbon::today());
        }

        // Clone the query for different payment methods so we don't pile up conditions
        // Note: We get() the collection first to avoid running 5 separate database queries 
        // if the dataset isn't huge. If it is huge, run separate sums on the query builder.
        // For typical invoicing apps, getting the collection for a day/month is fine.
        $periodInvoices = $statsQuery->get();

        $dailyStats = [
            'total' => $periodInvoices->sum('advance_payment'),
            'cash' => $periodInvoices->where('payment_method', 'cash')->sum('advance_payment'),
            'card' => $periodInvoices->where('payment_method', 'card')->sum('advance_payment'),
            'online' => $periodInvoices->where('payment_method', 'online')->sum('advance_payment'),
            'cheque' => $periodInvoices->where('payment_method', 'cheque')->sum('advance_payment'),
            'credit' => $periodInvoices->where('payment_method', 'credit')->sum('advance_payment'),
        ];

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

        // --- THIS IS THE FIX ---
        // Date range filters
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('invoice_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('invoice_date', '<=', $dateTo);
        }
        // --- END OF FIX ---

        $invoices = $query->paginate(20)->withQueryString();

        return Inertia::render('invoice/index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status']),
            'dailyStats' => $dailyStats,
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
            'overall_discount' => 'nullable|numeric|min:0',
            'overall_discount_type' => 'nullable|in:fixed,percentage',
        ]);

        try {
            // Eager load customer for SMS
            $jobCard->load('customer');

            $invoice = DB::transaction(function () use ($jobCard, $validated) {
                // Check if invoice already exists
                if ($jobCard->hasInvoice()) {
                    Log::warning('Attempted to create duplicate invoice', [
                        'job_card_id' => $jobCard->id,
                        'existing_invoice_id' => $jobCard->invoice->id,
                    ]);

                    // This redirect won't work inside a transaction,
                    // but we can throw an exception to stop it.
                    throw new \Exception('Invoice already exists for this job card');
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
                    'overall_discount' => $validated['overall_discount'] ?? 0,
                    'overall_discount_type' => $validated['overall_discount_type'] ?? 'fixed',
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

                $salesAccount = Account::where('code', '4000')->firstOrFail(); // Sales Revenue
                $receivablesAccount = Account::where('code', '1100')->firstOrFail(); // Accounts Receivable

                CreateLedgerEntries::run(
                    description: "Sale for Invoice #{$invoice->invoice_no}",
                    date: $invoice->invoice_date,
                    amount: $invoice->total,
                    debitAccount: $receivablesAccount, // Asset (what you're owed) increases
                    creditAccount: $salesAccount, // Income (what you've earned) increases
                    transactionable: $invoice
                );

                if ($invoice->advance_payment > 0) {
                    $cashAccount = Account::where('code', '1000')->firstOrFail(); // Cash & Bank
                    CreateLedgerEntries::run(
                        description: "Initial payment for Invoice #{$invoice->invoice_no}",
                        date: $invoice->invoice_date,
                        amount: $invoice->advance_payment,
                        debitAccount: $cashAccount, // Cash increases
                        creditAccount: $receivablesAccount, // What you're owed decreases
                        transactionable: $invoice
                    );
                }
                return $invoice;
            });

            // --- 🚀 3. SEND INVOICE CREATION SMS (AFTER TRANSACTION) ---
            $customer = $jobCard->customer;
            $phone = $customer->mobile ?? null; //

            if ($phone) {
                $name = $customer->name ?? 'Customer'; //
                $vehicleNo = $jobCard->vehicle->vehicle_no ?? ''; //
                $totalAmount = number_format($invoice->total, 2); //
                $dueAmount = number_format($invoice->remaining, 2); //
                $invoiceNo = $invoice->invoice_no; //

                // $reviewUrl = route('review.show', $invoice->review_token);
                $reviewUrl = 'https://gtdrive.lk/review/' . $invoice->review_token;

                $message = "Dear $name,\n\n" .
                    "Thank you for choosing GT Automech.\n" .
                    "Your invoice ($invoiceNo) for Rs. $totalAmount is ready.\n" .
                    "Amount due: Rs. $dueAmount.\n\n" .
                    "We value your feedback!\n" .
                    "Please tell us about your service below:\n$reviewUrl\n\n" .
                    "We appreciate your trust in our services.\n\n" .
                    "For inquiries: 077-409-8580\n\n" .
                    "- GT AutoMech";


                Log::info('Attempting to send invoice creation SMS', ['invoice_id' => $invoice->id, 'phone' => $phone]);
                $this->sendSms($phone, $message);
            }
            // --- 🚀 END SMS ---

            Log::info('Invoice and ledger entries created successfully', ['invoice_id' => $invoice->id]);
            return redirect()->route('dashboard.invoice.show', $invoice->id)->with('success', 'Invoice created successfully');

            // --- Note: Removed unreachable code that was here ---

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create invoice', [
                'job_card_id' => $jobCard->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Handle duplicate invoice exception gracefully
            if ($e->getMessage() === 'Invoice already exists for this job card') {
                return redirect()
                    ->route('dashboard.job-card.index') // Or back()
                    ->with('error', $e->getMessage());
            }

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
            'items.jobCardProduct',
            'items.jobCardVehicleService',
            'items.jobCardCharge',
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
            'payment_amount' => 'required|numeric|min:0.01|max:' . $invoice->remaining,
        ]);

        try {
            // 4. Load customer for SMS
            $invoice->load('customer');

            DB::transaction(function () use ($invoice, $validated) {
                $paymentAmount = (float) $validated['payment_amount'];

                $invoice->increment('advance_payment', $paymentAmount);

                // Get the *new* remaining balance
                $newRemaining = $invoice->fresh()->remaining;

                if ($newRemaining == 0) {
                    $invoice->update(['status' => 'paid']);
                }

                // 2. Record the new payment in the financial ledger
                $cashAccount = Account::where('code', '1000')->firstOrFail(); // Cash & Bank
                $receivablesAccount = Account::where('code', '1100')->firstOrFail(); // Accounts Receivable

                CreateLedgerEntries::run(
                    description: "Payment received for Invoice #{$invoice->invoice_no}",
                    date: now(),
                    amount: $paymentAmount,
                    debitAccount: $cashAccount,
                    creditAccount: $receivablesAccount,
                    transactionable: $invoice
                );

                // --- 🚀 5. SEND PAYMENT CONFIRMATION SMS ---
                $customer = $invoice->customer;
                $phone = $customer->mobile ?? null; //

                if ($phone) {
                    $name = $customer->name ?? 'Customer'; //
                    $paymentStr = number_format($paymentAmount, 2);
                    $remainingStr = number_format($newRemaining, 2);
                    $invoiceNo = $invoice->invoice_no; //

                    // $message = "Dear $name,\n" .
                    //     "We received your payment of Rs. $paymentStr for Invoice $invoiceNo.\n" .
                    //     "New Balance Due: Rs. $remainingStr\n" .
                    //     "Thank you!\n" .
                    //     "- GT AutoMech";

                    if ($newRemaining > 0) {
                        $paymentStatus = "Partially Paid – Remaining: Rs. $remainingStr";
                    } elseif ($newRemaining == 0) {
                        $paymentStatus = "Fully Paid";
                    } else {
                        // remove minus sign for display
                        $absBalance = number_format(abs($newRemaining), 2);
                        $paymentStatus = "Balance: Rs. $absBalance";
                    }

                    $message =
                        "Dear $name,\n\n" .
                        "Thank you for choosing GT Automech.\n\n" .
                        "Invoice #: $invoiceNo\n" .
                        "Payment Received: Rs. $paymentStr\n" .
                        "New Balance Due: Rs. $remainingStr\n" .
                        "Payment Status: $paymentStatus\n\n" .
                        "We appreciate your trust in our services.\n" .
                        "For inquiries: 077-409-8580\n\n" .
                        "- GT AutoMech";

                    Log::info('Attempting to send payment confirmation SMS', ['invoice_id' => $invoice->id, 'phone' => $phone]);
                    $this->sendSms($phone, $message);
                }
                // --- 🚀 END SMS ---

                Log::info('Invoice payment recorded and ledger created', [
                    'invoice_id' => $invoice->id,
                    'payment_added' => $paymentAmount,
                    'new_total_payment' => $invoice->advance_payment,
                ]);
            });

            return redirect()->back()->with('success', 'Payment recorded successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update invoice payment', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
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

    public function updateStatus(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,unpaid,partial,paid,cancelled',
        ]);

        try {
            DB::transaction(function () use ($invoice, $validated) {
                $oldStatus = $invoice->status;
                $newStatus = $validated['status'];

                // Business logic validations
                if ($oldStatus === 'cancelled') {
                    throw new \Exception('Cannot change status of a cancelled invoice');
                }

                if ($newStatus === 'paid' && $invoice->advance_payment < $invoice->total) {
                    throw new \Exception('Cannot mark as paid. Payment incomplete. Remaining: Rs. ' . $invoice->remaining);
                }

                if ($newStatus === 'partial' && $invoice->advance_payment <= 0) {
                    throw new \Exception('Cannot mark as partial. No payments recorded yet.');
                }

                // Update status
                $invoice->update(['status' => $newStatus]);

                Log::info('Invoice status updated', [
                    'invoice_id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'user_id' => auth()->id(),
                ]);
            });

            return redirect()
                ->back()
                ->with('success', 'Invoice status updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update invoice status', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    public function updatePaymentMethod(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,card,online,cheque,credit',
        ]);

        try {
            DB::transaction(function () use ($invoice, $validated) {
                $oldPaymentMethod = $invoice->payment_method;
                $newPaymentMethod = $validated['payment_method'];

                // Update payment_method
                $invoice->update(['payment_method' => $newPaymentMethod]);

                Log::info('Invoice payment method updated', [
                    'invoice_id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'old_payment_method' => $oldPaymentMethod,
                    'new_payment_method' => $newPaymentMethod,
                    'user_id' => auth()->id(),
                ]);
            });

            return redirect()
                ->back()
                ->with('success', 'Invoice payment method updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update invoice payment method', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    public function directCreate()
    {
        $customers = Customer::orderBy('name')->get();
        $stocks = Stock::with('product')
            ->whereHas('product')
            ->where('quantity', '>', 0)
            ->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'name' => $stock->product->name . ' (' . $stock->quantity . ' available)',
                    'price' => $stock->selling_price,
                    'available_qty' => $stock->quantity,
                ];
            });

        $services = VehicleService::with(['options' => function($q) {
            $q->where('status', 'active');
        }])->where('status', 'active')->get();

        return Inertia::render('invoice/direct-create', [
            'customers' => $customers,
            'stocks' => $stocks,
            'services' => $services,
            'default_invoice_date' => date('Y-m-d'),
        ]);
    }

    public function directStore(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'payment_method' => 'required|in:cash,card,online,cheque,credit',
            'advance_payment' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:service,product,charge',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_type' => 'required|in:fixed,percentage',
            'items.*.discount_amount' => 'required|numeric|min:0',
            'items.*.stock_id' => 'nullable|exists:stocks,id',
            'items.*.vehicle_service_option_id' => 'nullable|exists:vehicle_service_options,id',
            'overall_discount' => 'nullable|numeric|min:0',
            'overall_discount_type' => 'nullable|in:fixed,percentage',
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated) {
                // Generate invoice number
                $invoiceNo = 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 6, '0', STR_PAD_LEFT);

                $servicesTotal = 0;
                $productsTotal = 0;
                $chargesTotal = 0;
                $discountTotal = 0;

                foreach ($validated['items'] as $item) {
                    $itemSubtotal = $item['quantity'] * $item['unit_price'];
                    $itemDiscount = 0;

                    if ($item['discount_type'] === 'percentage') {
                        $itemDiscount = ($itemSubtotal * $item['discount_amount']) / 100;
                    } else {
                        $itemDiscount = $item['discount_amount'];
                    }

                    $itemTotal = $itemSubtotal - $itemDiscount;
                    $discountTotal += $itemDiscount;

                    if ($item['type'] === 'service') $servicesTotal += $itemTotal;
                    if ($item['type'] === 'product') $productsTotal += $itemTotal;
                    if ($item['type'] === 'charge') $chargesTotal += $itemTotal;
                }

                $subtotal = $servicesTotal + $productsTotal + $chargesTotal + $discountTotal;

                // Create invoice
                $invoice = Invoice::create([
                    'invoice_no' => $invoiceNo,
                    'customer_id' => $validated['customer_id'],
                    'user_id' => auth()->id(),
                    'services_total' => $servicesTotal,
                    'products_total' => $productsTotal,
                    'charges_total' => $chargesTotal,
                    'subtotal' => $subtotal,
                    'discount_total' => $discountTotal,
                    'advance_payment' => $validated['advance_payment'],
                    'total' => $subtotal - $discountTotal,
                    'payment_method' => $validated['payment_method'],
                    'invoice_date' => $validated['invoice_date'],
                    'due_date' => $validated['due_date'] ?? null,
                    'remarks' => $validated['remarks'] ?? null,
                    'overall_discount' => $validated['overall_discount'] ?? 0,
                    'overall_discount_type' => $validated['overall_discount_type'] ?? 'fixed',
                    'status' => 'draft',
                ]);

                foreach ($validated['items'] as $itemData) {
                    $itemSubtotal = $itemData['quantity'] * $itemData['unit_price'];
                    $itemDiscount = 0;

                    if ($itemData['discount_type'] === 'percentage') {
                        $itemDiscount = ($itemSubtotal * $itemData['discount_amount']) / 100;
                    } else {
                        $itemDiscount = $itemData['discount_amount'];
                    }

                    $lineTotal = $itemSubtotal - $itemDiscount;
                    
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'item_type' => $itemData['type'],
                        'stock_id' => $itemData['stock_id'] ?? null,
                        'vehicle_service_option_id' => $itemData['vehicle_service_option_id'] ?? null,
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'discount_type' => $itemData['discount_type'],
                        'discount_amount' => $itemData['discount_amount'],
                        'discount_total' => $itemDiscount,
                        'line_total' => $lineTotal,
                    ]);

                    // Reduce stock if product
                    if ($itemData['type'] === 'product' && !empty($itemData['stock_id'])) {
                        $stock = Stock::findOrFail($itemData['stock_id']);
                        $stock->decrement('quantity', $itemData['quantity']);
                    }
                }

                // Ledger entries
                $salesAccount = Account::where('code', '4000')->firstOrFail();
                $receivablesAccount = Account::where('code', '1100')->firstOrFail();

                CreateLedgerEntries::run(
                    description: "Direct Sale for Invoice #{$invoice->invoice_no}",
                    date: Carbon::parse($invoice->invoice_date),
                    amount: $invoice->total,
                    debitAccount: $receivablesAccount,
                    creditAccount: $salesAccount,
                    transactionable: $invoice
                );

                if ($invoice->advance_payment > 0) {
                    $cashAccount = Account::where('code', '1000')->firstOrFail();
                    CreateLedgerEntries::run(
                        description: "Initial payment for Direct Invoice #{$invoice->invoice_no}",
                        date: Carbon::parse($invoice->invoice_date),
                        amount: $invoice->advance_payment,
                        debitAccount: $cashAccount,
                        creditAccount: $receivablesAccount,
                        transactionable: $invoice
                    );
                }

                return $invoice;
            });

            // Send SMS if needed (reusing logic from standard store)
            $customer = Customer::find($validated['customer_id']);
            if ($customer && $customer->mobile) {
                $totalAmount = number_format($invoice->total, 2);
                $dueAmount = number_format($invoice->remaining, 2);
                $reviewUrl = 'https://gtdrive.lk/review/' . $invoice->review_token;
                
                $message = "Dear {$customer->name},\n\n" .
                    "Thank you for choosing GT Automech.\n" .
                    "Your invoice ($invoice->invoice_no) for Rs. $totalAmount is ready.\n" .
                    "Amount due: Rs. $dueAmount.\n\n" .
                    "We value your feedback!\n" .
                    "Please tell us about your service below:\n$reviewUrl\n\n" .
                    "We appreciate your trust in our services.\n\n" .
                    "For inquiries: 077-409-8580\n\n" .
                    "- GT AutoMech";

                $this->sendSms($customer->mobile, $message);
            }

            return redirect()->route('dashboard.invoice.show', $invoice->id)->with('success', 'Direct invoice created successfully');

        } catch (\Exception $e) {
            Log::error('Failed to create direct invoice', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to create invoice: ' . $e->getMessage()])->withInput();
        }
    }
}
