<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\JobCard;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = 20;

        // Build query with search and filters
        $invoicesQuery = Invoice::query()
            ->with(['customer', 'jobCard'])
            ->select([
                'id',
                'invoice_no',
                'customer_id',
                'job_card_id',
                'total',
                'status',
                'invoice_date',
                'due_date'
            ]);

        // Apply search
        if ($search = $request->input('search')) {
            $invoicesQuery->where('invoice_no', 'like', "%{$search}%");
        }

        // Apply filters
        if ($status = $request->input('status')) {
            $invoicesQuery->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $invoicesQuery->whereDate('invoice_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $invoicesQuery->whereDate('invoice_date', '<=', $dateTo);
        }

        // Get paginated results
        $invoices = $invoicesQuery->paginate($perPage)->withQueryString();

        return Inertia::render('invoice/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
            'statusOptions' => [
                ['value' => '', 'label' => 'All Statuses'],
                ['value' => 'paid', 'label' => 'Paid'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'unpaid', 'label' => 'Unpaid'],
            ],
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('invoice/create');
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id', // Assume Customer model exists
            'job_card_id' => 'nullable|exists:job_cards,id', // Assume JobCard exists
            'vehicle_id' => 'required|exists:vehicles,id', // Assume Vehicle exists
            'mileage' => 'required|integer|min:1',
            'oil_brand_id' => 'nullable|exists:brands,id',
            'oil_id' => 'nullable|exists:products,id',
            'oil_filter_id' => 'nullable|exists:products,id',
            'drain_plug_seal_id' => 'nullable|exists:products,id',
            'services' => 'array',
            'services.*.service_id' => 'required|exists:products,id', // Assume services are Products; adjust if separate model
            'services.*.option_id' => 'nullable|exists:service_options,id', // Assume if options exist
            'services.*.ignored' => 'boolean',
            'advance_payment' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $invoiceNo = 'INV-' . str_pad(Invoice::max('id') + 1, 6, '0', STR_PAD_LEFT); // Simple auto invoice_no

            $invoice = Invoice::create([
                'invoice_no' => $invoiceNo,
                'job_card_id' => $validated['job_card_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'subtotal' => 0, // Calculate later
                'discount_total' => 0,
                'advance_payment' => $validated['advance_payment'] ?? 0,
                'total' => 0,
                'status' => 'draft',
                'invoice_date' => Carbon::now(),
                'due_date' => Carbon::now()->addDays(30),
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $subtotal = 0;

            // Helper to add item
            $addItem = function ($description, $productId = null) use ($invoice, &$subtotal) {
                $product = $productId ? Product::find($productId) : null;
                $unitPrice = $product ? $product->price : 0; // From accessor
                $quantity = 1; // Fixed for now
                $lineTotal = $unitPrice * $quantity;

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $description,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);

                $subtotal += $lineTotal;
            };

            // Add Parts
            if (isset($validated['oil_id'])) {
                $addItem('Oil: ' . Product::find($validated['oil_id'])->name, $validated['oil_id']);
            }
            // Similarly for oil_filter_id, drain_plug_seal_id...

            // Add Services (assume service_id is Product ID; adjust description if needed)
            foreach ($validated['services'] ?? [] as $service) {
                if (!$service['ignored']) {
                    $serviceProduct = Product::find($service['service_id']);
                    $option = $service['option_id'] ? /* Assume ServiceOption::find */ null : null;
                    $description = $serviceProduct->name . ($option ? ' - ' . $option->name : '');
                    $addItem($description, $service['service_id']);
                }
            }

            // Update Invoice
            $total = $subtotal - $invoice->discount_total;
            $invoice->update([
                'subtotal' => $subtotal,
                'total' => $total,
            ]);

            return Inertia::location("/dashboard/job-card/invoice/{$invoice->id}");
        });
    }

    public function edit(Request $request)
    {
        return Inertia::render('invoice/edit');
    }

    public function updateDiscounts(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'items' => 'array',
            'items.*.id' => 'required|exists:invoice_items,id',
            'items.*.discount_type' => 'nullable|in:percentage,amount,foc',
            'items.*.discount_value' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($invoice, $validated) {
            $discountTotal = 0;
            foreach ($validated['items'] as $itemData) {
                $item = InvoiceItem::find($itemData['id']);
                if ($item->invoice_id !== $invoice->id) continue;

                $subLine = $item->unit_price * $item->quantity;
                $discountValue = 0;
                $lineTotal = $subLine;

                if ($itemData['discount_type'] === 'foc') {
                    $discountValue = $subLine;
                    $lineTotal = 0;
                } elseif ($itemData['discount_type'] === 'percentage' && $itemData['discount_value']) {
                    $discountValue = $subLine * ($itemData['discount_value'] / 100);
                    $lineTotal -= $discountValue;
                } elseif ($itemData['discount_type'] === 'amount' && $itemData['discount_value']) {
                    $discountValue = $itemData['discount_value'];
                    $lineTotal -= $discountValue;
                }

                $lineTotal = max(0, $lineTotal);

                $item->update([
                    'discount_type' => $itemData['discount_type'],
                    'discount_value' => $discountValue,
                    'line_total' => $lineTotal,
                ]);

                $discountTotal += $discountValue;
            }

            // Recalculate invoice
            $newSubtotal = $invoice->items->sum(fn($item) => $item->unit_price * $item->quantity); // Should match original
            $newTotal = $invoice->items->sum('line_total');
            $invoice->update([
                'subtotal' => $newSubtotal,
                'discount_total' => $discountTotal,
                'total' => $newTotal,
            ]);

            return response()->json(['success' => true, 'invoice' => $invoice->fresh()->load('items')]);
        });
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('Invoice', ['invoice' => $invoice->load('items', 'customer', 'jobCard')]);
    }

    public function viewInvoice(Request $request, $jobcard_id)
    {
        try {
            Log::info('Loading invoice for job card', ['job_card_id' => $jobcard_id]);

            // Find the job card with all necessary relationships
            $jobCard = JobCard::with([
                'customer',
                'vehicle.model',
                'serviceJobCard.oilItem.product',
                'serviceJobCard.oilFilterItem.product',
                'serviceJobCard.drainPlugSealItem.product',
                'jobCardVehicleServices.vehicleService',
                'jobCardVehicleServices.vehicleServiceOption'
            ])->findOrFail($jobcard_id); // Fixed typo: was $jobcardid

            Log::info('Job card loaded successfully', [
                'job_card_id' => $jobCard->id,
                'customer_id' => $jobCard->customer_id,
                'vehicle_id' => $jobCard->vehicle_id
            ]);

            // Get advance payment from URL parameter
            $advancePayment = $request->query('advance', 0);
            Log::info('Advance payment from URL', ['advance' => $advancePayment]);

            // Prepare parts items
            $partsItems = [];

            // Add oil if present
            if ($jobCard->serviceJobCard && $jobCard->serviceJobCard->oilItem) {
                $oil = $jobCard->serviceJobCard->oilItem;
                $partsItems[] = [
                    'id' => 'oil_' . $oil->id,
                    'description' => $oil->product->name ?? 'Engine Oil',
                    'quantity' => 1,
                    'unit_price' => $oil->selling_price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $oil->selling_price, // Fixed typo: was sellingprice
                ];
                Log::info('Added oil item', ['oil_id' => $oil->id, 'price' => $oil->selling_price]);
            }

            // Add oil filter if present
            if ($jobCard->serviceJobCard && $jobCard->serviceJobCard->oilFilterItem) {
                $filter = $jobCard->serviceJobCard->oilFilterItem;
                $partsItems[] = [
                    'id' => 'filter_' . $filter->id,
                    'description' => $filter->product->name ?? 'Oil Filter',
                    'quantity' => 1,
                    'unit_price' => $filter->selling_price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $filter->selling_price, // Fixed typo: was sellingprice
                ];
                Log::info('Added filter item', ['filter_id' => $filter->id, 'price' => $filter->selling_price]);
            }

            // Add drain plug seal if present
            if ($jobCard->serviceJobCard && $jobCard->serviceJobCard->drainPlugSealItem) {
                $seal = $jobCard->serviceJobCard->drainPlugSealItem;
                $partsItems[] = [
                    'id' => 'seal_' . $seal->id,
                    'description' => $seal->product->name ?? 'Drain Plug Seal',
                    'quantity' => 1,
                    'unit_price' => $seal->selling_price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $seal->selling_price,
                ];
                Log::info('Added seal item', ['seal_id' => $seal->id, 'price' => $seal->selling_price]);
            }

            Log::info('Total parts items prepared', ['count' => count($partsItems)]);

            // Prepare services items
            $servicesItems = [];
            foreach ($jobCard->jobCardVehicleServices->where('is_included', true) as $service) {
                // Get price from vehicleServiceOption
                $price = $service->vehicleServiceOption
                    ? $service->vehicleServiceOption->price
                    : 0; // Default to 0 if no option selected

                $serviceName = $service->vehicleService->name;
                if ($service->vehicleServiceOption) {
                    $serviceName .= ' - ' . $service->vehicleServiceOption->name;
                }

                $servicesItems[] = [
                    'id' => 'service_' . $service->id,
                    'description' => $serviceName,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $price,
                ];

                Log::info('Added service item', [
                    'service_id' => $service->id,
                    'name' => $serviceName,
                    'price' => $price
                ]);
            }

            Log::info('Total service items prepared', ['count' => count($servicesItems)]);

            // Combine all items for backward compatibility
            $invoiceItems = array_merge($partsItems, $servicesItems);

            // Calculate totals
            $partsTotal = collect($partsItems)->sum('line_total');
            $servicesTotal = collect($servicesItems)->sum('line_total');
            $subtotal = $partsTotal + $servicesTotal;

            Log::info('Calculated totals', [
                'parts_total' => $partsTotal,
                'services_total' => $servicesTotal,
                'subtotal' => $subtotal
            ]);

            // Generate invoice number
            $invoiceNo = 'INV-' . date('Ymd') . '-' . str_pad($jobcard_id, 4, '0', STR_PAD_LEFT);

            // Prepare invoice data
            $invoice = [
                'id' => null, // Not saved yet
                'invoice_no' => $invoiceNo,
                'job_card_id' => $jobcard_id,
                'customer_id' => $jobCard->customer->id,
                'invoice_date' => now()->toISOString(),
                'due_date' => now()->addDays(7)->toISOString(),
                'customer' => [
                    'id' => $jobCard->customer->id,
                    'name' => $jobCard->customer->name,
                    'phone' => $jobCard->customer->mobile ?? 'N/A',
                    'email' => $jobCard->customer->email ?? 'N/A',
                    'address' => $jobCard->customer->address ?? 'N/A',
                ],
                'jobCard' => [
                    'id' => $jobCard->id,
                    'vehicle' => [
                        'name' => $jobCard->vehicle->vehicle_no . ' - ' .
                            $jobCard->vehicle->make_year . ' ' .
                            ($jobCard->vehicle->model->name ?? 'Unknown Model')
                    ]
                ],
                'items' => $invoiceItems, // Combined items for backward compatibility
                'parts' => $partsItems,   // Separate parts array
                'services' => $servicesItems, // Separate services array
                'subtotal' => $subtotal,
                'total' => $subtotal, // Before any discounts
                'discount_total' => 0,
                'advance_payment' => floatval($advancePayment),
                'status' => 'draft',
                'remarks' => null,
            ];

            Log::info('Invoice data prepared successfully', [
                'invoice_no' => $invoiceNo,
                'total_items' => count($invoiceItems),
                'total_amount' => $subtotal
            ]);

            return Inertia::render('job-card/invoice', [
                'invoice' => $invoice
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Job card not found', [
                'job_card_id' => $jobcard_id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Job card not found.');
        } catch (\Exception $e) {
            Log::error('Error loading invoice', [
                'job_card_id' => $jobcard_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to load invoice data: ' . $e->getMessage());
        }
    }

    public function storeInvoice(Request $request)
    {
        try {
            $validated = $request->validate([
                'job_card_id' => 'required|exists:job_cards,id',
                'invoice_no' => 'required|string|max:255',
                'customer_id' => 'required|exists:customers,id',
                'items' => 'required|array|min:1',
                'items.*.description' => 'required|string',
                'items.*.quantity' => 'required|numeric|min:0',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.discount_type' => 'nullable|string|in:percentage,amount,foc',
                'items.*.discount_value' => 'nullable|numeric|min:0',
                'items.*.line_total' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'total' => 'required|numeric|min:0',
                'discount_total' => 'nullable|numeric|min:0',
                'advance_payment' => 'nullable|numeric|min:0',
                'remarks' => 'nullable|string',
            ]);

            Log::info('Invoice store request received', [
                'job_card_id' => $validated['job_card_id'],
                'invoice_no' => $validated['invoice_no'],
                'items_count' => count($validated['items'])
            ]);

            DB::beginTransaction();

            $existingInvoice = Invoice::where('job_card_id', $validated['job_card_id'])->first();

            if ($existingInvoice) {
                Log::info('Updating existing invoice', ['invoice_id' => $existingInvoice->id]);

                $invoice = $existingInvoice;
                $invoice->update([
                    'invoice_no' => $validated['invoice_no'], // ADD THIS LINE
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'discount_total' => $validated['discount_total'] ?? 0,
                    'advance_payment' => $validated['advance_payment'] ?? 0,
                    'status' => 'paid',
                    'remarks' => $validated['remarks'] ?? null,
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(7),
                ]);

                $invoice->items()->delete();

                Log::info('Existing invoice updated', ['invoice_id' => $invoice->id]);
            } else {
                Log::info('Creating new invoice');

                $invoice = Invoice::create([
                    'invoice_no' => $validated['invoice_no'],
                    'job_card_id' => $validated['job_card_id'],
                    'customer_id' => $validated['customer_id'],
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'discount_total' => $validated['discount_total'] ?? 0,
                    'advance_payment' => $validated['advance_payment'] ?? 0,
                    'status' => 'draft',
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(7),
                    'remarks' => $validated['remarks'] ?? null,
                ]);

                Log::info('New invoice created', ['invoice_id' => $invoice->id]);
            }

            // Create invoice items with proper null handling
            $invoiceItems = [];
            foreach ($validated['items'] as $item) {
                $invoiceItems[] = [
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_type' => $item['discount_type'] ?? null, // ADD null coalescing
                    'discount_value' => $item['discount_value'] ?? 0, // ADD null coalescing
                    'line_total' => $item['line_total'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            InvoiceItem::insert($invoiceItems);

            Log::info('Invoice items created', ['count' => count($invoiceItems)]);

            DB::commit();

            Log::info('Invoice saved successfully', [
                'invoice_id' => $invoice->id,
                'invoice_no' => $invoice->invoice_no
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invoice saved successfully',
                'data' => [
                    'invoice_id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'total' => $invoice->total,
                    'remaining' => $invoice->remaining,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Invoice validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing invoice', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save invoice',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function view($invoice_id)
    {
        $invoice = Invoice::with([
            'customer',
            'jobCard.vehicle.brand',
            'jobCard.vehicle.model',
            'jobCard.user',
            'items',
        ])->findOrFail($invoice_id);

        // Calculate totals
        $subtotal = $invoice->items->sum('line_total');
        $discount = $invoice->discount_total ?? 0;
        $advance = $invoice->advance_payment ?? 0;
        $grandTotal = $invoice->total ?? ($subtotal - $discount);
        $remaining = max(0, $grandTotal - $advance);

        $totals = [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'advance'  => $advance,
            'grand_total' => $grandTotal,
            'remaining' => $remaining,
        ];

        return Inertia::render('invoice/view', [
            'invoice' => $invoice,
            'totals' => $totals,
        ]);
    }
}
