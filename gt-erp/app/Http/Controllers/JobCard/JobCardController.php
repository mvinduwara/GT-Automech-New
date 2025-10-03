<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\JobCard;
use App\Models\JobCardVehicleService;
use App\Models\ServiceJobCard;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\VehicleService;
use App\Models\VehicleServiceOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class JobCardController extends Controller
{
    public function index(Request $request)
    {
        $query = JobCard::with(['customer', 'vehicle', 'user'])
            ->orderBy('id', 'desc');

        // 🔍 Search (by job card no, customer name, or vehicle no)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('job_card_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('vehicle', fn($vq) => $vq->where('vehicle_no', 'like', "%{$search}%"));
            });
        }

        // 🏷️ Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // 🏷️ Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Pending job cards (separate for grid)
        $pendingJobCards = JobCard::with(['customer', 'vehicle'])
            ->where('status', 'pending')
            ->latest()
            ->take(6) // show only latest 6 in grid
            ->get();

        $jobCards = $query->paginate(20)->withQueryString();

        return Inertia::render('job-card/index', [
            'jobCards' => $jobCards,
            'pendingJobCards' => $pendingJobCards,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }
    public function create(Request $request)
    {
        $brands = VehicleBrand::all(['id', 'name']);
        $models = VehicleModel::all(['id', 'name', 'vehicle_brand_id']);

        return Inertia::render('job-card/create', [
            'brands' => $brands,
            'models' => $models,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'vehicle_id' => 'required|exists:vehicles,id',
                'customer_id' => 'required|exists:customers,id',
                'mileage' => 'required|numeric',
                'remarks' => 'nullable|string',
            ]);

            $validated['job_card_no'] = 'JC-' . Str::upper(Str::random(8));
            $validated['user_id'] = auth()->id();
            $validated['date'] = now();
            $validated['type'] = 'general';
            $validated['status'] = 'pending';

            $jobCard = JobCard::create($validated);

            Log::info('Job Card created successfully', ['job_card_id' => $jobCard->id]);
            // return redirect()
            //     ->back()
            //     ->with([
            //         'success' => 'Job Card created successfully.',
            //         'job_card_id' => $jobCard->id,
            //     ]);

            return redirect()
                ->to('/dashboard/job-card/open?job_card_id=' . $jobCard->id)
                ->with('success', 'Job Card created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating Job Card', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Something went wrong while creating the job card.');
        }
    }
    public function updateRemarks(Request $request, $jobCard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobCard_id);

            $validated = $request->validate([
                'remarks' => 'nullable|string|max:1000', // Added max length for better validation
            ]);

            $oldRemarks = $jobCard->remarks; // Store old remarks for logging
            $jobCard->update($validated);

            Log::info('Job Card remarks updated successfully', [
                'job_card_id' => $jobCard->id,
                'old_remarks' => $oldRemarks,
                'new_remarks' => $jobCard->remarks,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Job Card remarks updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for remarks update', [
                'job_card_id' => $jobCard_id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Job Card remarks validation failed', [
                'job_card_id' => $jobCard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating Job Card remarks', [
                'job_card_id' => $jobCard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->with('error', 'Something went wrong while updating the job card remarks.');
        }
    }
    public function jobCardStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'job_card_id' => 'required|exists:job_cards,id',
                'oil' => 'required|exists:stocks,id',
                'oil_filter' => 'required|exists:stocks,id',
                'drain_plug_seal' => 'required|exists:stocks,id',
            ]);

            $validated['ac'] = null;
            $validated['electronic'] = null;
            $validated['mechanical'] = null;
            $validated['status'] = 'pending';

            $jobCard = ServiceJobCard::create($validated);



            Log::info('Job Card created successfully', ['job_card_id' => $jobCard->id]);
            return redirect()
                ->back()
                ->with('success', 'Job Card created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating Job Card', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Something went wrong while creating the job card.');
        }
    }

    public function storeServices(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'job_card_id' => 'required|exists:job_cards,id',
                'services' => 'required|array|min:1',
                'services.*.service_id' => 'required|exists:vehicle_services,id',
                'services.*.option_id' => 'nullable|exists:vehicle_service_options,id',
                'services.*.ignored' => 'required|boolean',
            ]);

            $jobCardId = $validated['job_card_id'];
            $services = $validated['services'];

            // Check if job card exists and belongs to current user (optional security check)
            $jobCard = JobCard::findOrFail($jobCardId);
            
            // Start database transaction
            DB::beginTransaction();

            // Delete existing services for this job card to avoid duplicates
            JobCardVehicleService::where('job_card_id', $jobCardId)->delete();

            $savedServices = [];

            foreach ($services as $serviceData) {
                $vehicleService = VehicleService::findOrFail($serviceData['service_id']);
                
                // Validate that option belongs to the service if provided
                if (!empty($serviceData['option_id'])) {
                    $serviceOption = VehicleServiceOption::where('id', $serviceData['option_id'])
                        ->where('vehicle_service_id', $serviceData['service_id'])
                        ->firstOrFail();
                } else {
                    $serviceOption = null;
                }

                // Create JobCardVehicleService record
                $jobCardService = JobCardVehicleService::create([
                    'job_card_id' => $jobCardId,
                    'vehicle_service_id' => $serviceData['service_id'],
                    'vehicle_service_option_id' => $serviceData['option_id'],
                    'is_included' => !$serviceData['ignored'], // Convert ignored to is_included
                    'price' => $serviceOption ? $serviceOption->price : ($vehicleService->base_price ?? 0),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $savedServices[] = [
                    'id' => $jobCardService->id,
                    'service_id' => $serviceData['service_id'],
                    'service_name' => $vehicleService->name,
                    'option_id' => $serviceData['option_id'],
                    'option_name' => $serviceOption ? $serviceOption->name : null,
                    'price' => $jobCardService->price,
                    'is_included' => $jobCardService->is_included,
                ];
            }

            // Calculate totals
            $totalAmount = collect($savedServices)
                ->where('is_included', true)
                ->sum('price');

            $includedServicesCount = collect($savedServices)
                ->where('is_included', true)
                ->count();

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Job Card created successfully.');

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing job card services: ' . $e->getMessage(), [
                'job_card_id' => $request->job_card_id ?? null,
                'services' => $request->services ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving services',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function view(Request $request, $jobcard_id)
    {
        try {
            $jobCard = JobCard::with([
                'vehicle' => function ($query) {
                    $query->with(['brand', 'model']);
                },
                'customer',
                'user',
                'jobCardVehicleServices' => function ($query) {
                    $query->with([
                        'vehicleService',
                        'vehicleServiceOption'
                    ]);
                },
                'serviceJobCard' => function ($query) {
                    $query->with([
                        'oilItem' => function ($subQuery) {
                            $subQuery->with(['product', 'alternativeProduct']);
                        },
                        'oilFilterItem' => function ($subQuery) {
                            $subQuery->with(['product', 'alternativeProduct']);
                        },
                        'drainPlugSealItem' => function ($subQuery) {
                            $subQuery->with(['product', 'alternativeProduct']);
                        },
                        'acTechnician' => function ($subQuery) {
                            $subQuery->with('department');
                        },
                        'electronicTechnician' => function ($subQuery) {
                            $subQuery->with('department');
                        },
                        'mechanicalTechnician' => function ($subQuery) {
                            $subQuery->with('department');
                        }
                    ]);
                }
            ])->findOrFail($jobcard_id);

            // Calculate totals for services
            $serviceTotal = $jobCard->jobCardVehicleServices
                ->where('is_included', true)
                ->sum(function ($service) {
                    return $service->vehicleServiceOption->price ?? 0;
                });

            // Calculate stock items total
            $stockTotal = 0;
            if ($jobCard->serviceJobCard) {
                $stockItems = [
                    $jobCard->serviceJobCard->oilItem,
                    $jobCard->serviceJobCard->oilFilterItem,
                    $jobCard->serviceJobCard->drainPlugSealItem,
                ];

                foreach ($stockItems as $item) {
                    if ($item && $item->selling_price) {
                        $stockTotal += $item->selling_price;
                    }
                }
            }

            $grandTotal = $serviceTotal + $stockTotal;

            Log::info('Job Card viewed successfully', [
                'job_card_id' => $jobcard_id,
                'job_card_no' => $jobCard->job_card_no,
                'customer_name' => $jobCard->customer->name ?? 'N/A',
                'vehicle_no' => $jobCard->vehicle->vehicle_no ?? 'N/A',
                'service_total' => $serviceTotal,
                'stock_total' => $stockTotal,
                'grand_total' => $grandTotal,
                'user_id' => auth()->id(),
                'viewed_at' => now()
            ]);

            return Inertia::render('job-card/view', [
                'jobCard' => $jobCard,
                'totals' => [
                    'service_total' => $serviceTotal,
                    'stock_total' => $stockTotal,
                    'grand_total' => $grandTotal
                ]
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found', [
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return redirect()->route('dashboard.job-card.index')
                ->with('error', 'Job Card not found');
        } catch (\Exception $e) {
            Log::error('Error loading Job Card view', [
                'job_card_id' => $jobcard_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return redirect()->route('dashboard.job-card.index')
                ->with('error', 'Something went wrong while loading the job card.');
        }
    }

    public function updateStatus(Request $request, $jobcard_id)
    {
        try {
            $jobCard = JobCard::findOrFail($jobcard_id);

            $validated = $request->validate([
                'status' => 'required|string|in:pending,complete,cancelled',
            ]);

            $oldStatus = $jobCard->status; // Store old status for logging
            $jobCard->update($validated);

            Log::info('Job Card status updated successfully', [
                'job_card_id' => $jobCard->id,
                'job_card_no' => $jobCard->job_card_no,
                'old_status' => $oldStatus,
                'new_status' => $jobCard->status,
                'user_id' => auth()->id(),
                'updated_at' => now(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('success', 'Job Card status updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Job Card not found for status update', [
                'job_card_id' => $jobcard_id,
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', 'Job Card not found');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Job Card status validation failed', [
                'job_card_id' => $jobcard_id,
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating Job Card status', [
                'job_card_id' => $jobcard_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', 'Something went wrong while updating the job card status.');
        }
    }

    public function viewInvoicex(Request $request, $jobcard_id)
    {
        try {
            // Find the job card with all necessary relationships
            $jobCard = JobCard::with([
                'customer',
                'vehicle.model',
                'serviceJobCard.oilItem.product',
                'serviceJobCard.oilFilterItem.product', 
                'serviceJobCard.drainPlugSealItem.product',
                'jobCardVehicleServices.vehicleService',
                'jobCardVehicleServices.vehicleServiceOption'
            ])->findOrFail($jobcard_id);

            // Get advance payment from URL parameter
            $advancePayment = $request->query('advance', 0);

            // Prepare invoice items for parts
            $invoiceItems = [];

            // Add oil if present
            if ($jobCard->serviceJobCard && $jobCard->serviceJobCard->oilItem) {
                $oil = $jobCard->serviceJobCard->oilItem;
                $invoiceItems[] = [
                    'id' => 'oil_' . $oil->id,
                    'description' => 'Oil: ' . ($oil->product->name ?? 'Engine Oil'),
                    'quantity' => 1,
                    'unit_price' => $oil->selling_price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $oil->selling_price,
                ];
            }

            // Add oil filter if present
            if ($jobCard->serviceJobCard && $jobCard->serviceJobCard->oilFilterItem) {
                $filter = $jobCard->serviceJobCard->oilFilterItem;
                $invoiceItems[] = [
                    'id' => 'filter_' . $filter->id,
                    'description' => 'Filter: ' . ($filter->product->name ?? 'Oil Filter'),
                    'quantity' => 1,
                    'unit_price' => $filter->selling_price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $filter->selling_price,
                ];
            }

            // Add drain plug seal if present
            if ($jobCard->serviceJobCard && $jobCard->serviceJobCard->drainPlugSealItem) {
                $seal = $jobCard->serviceJobCard->drainPlugSealItem;
                $invoiceItems[] = [
                    'id' => 'seal_' . $seal->id,
                    'description' => 'Seal: ' . ($seal->product->name ?? 'Drain Plug Seal'),
                    'quantity' => 1,
                    'unit_price' => $seal->selling_price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $seal->selling_price,
                ];
            }

            // Add services
            foreach ($jobCard->jobCardVehicleServices->where('is_included', true) as $service) {
                $price = $service->vehicleServiceOption 
                    ? $service->vehicleServiceOption->price 
                    : ($service->vehicleService->base_price ?? 0);

                $serviceName = $service->vehicleService->name;
                if ($service->vehicleServiceOption) {
                    $serviceName .= ' - ' . $service->vehicleServiceOption->name;
                }

                $invoiceItems[] = [
                    'id' => 'service_' . $service->id,
                    'description' => 'Service: ' . $serviceName,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'discount_type' => null,
                    'discount_value' => null,
                    'line_total' => $price,
                ];
            }

            // Calculate totals
            $subtotal = collect($invoiceItems)->sum('line_total');
            $total = $subtotal; // Before any discounts

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
                    'phone' => $jobCard->customer->mobile,
                    'email' => $jobCard->customer->email ?? 'N/A',
                    'address' => $jobCard->customer->address,
                ],
                'jobCard' => [
                    'id' => $jobCard->id,
                    'vehicle' => [
                        'name' => $jobCard->vehicle->vehicle_no . ' - ' . 
                                 $jobCard->vehicle->make_year . ' ' . 
                                 ($jobCard->vehicle->model->name ?? 'Unknown Model')
                    ]
                ],
                'items' => $invoiceItems,
                'subtotal' => $subtotal,
                'total' => $total,
                'discount_total' => 0,
                'advance_payment' => floatval($advancePayment),
                'status' => 'draft',
                'remarks' => null,
            ];

            return Inertia::render('Invoice/Invoice', [
                'invoice' => $invoice
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading invoice: ' . $e->getMessage(), [
                'job_card_id' => $jobcard_id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to load invoice data.');
        }
    }

    public function storeInvoicex(Request $request)
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

            DB::beginTransaction();

            // Check if invoice already exists for this job card
            $existingInvoice = Invoice::where('job_card_id', $validated['job_card_id'])->first();
            
            if ($existingInvoice) {
                // Update existing invoice
                $invoice = $existingInvoice;
                $invoice->update([
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'discount_total' => $validated['discount_total'] ?? 0,
                    'advance_payment' => $validated['advance_payment'] ?? 0,
                    'status' => 'finalized',
                    'remarks' => $validated['remarks'],
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(7),
                ]);

                // Delete existing items
                $invoice->items()->delete();
            } else {
                // Create new invoice
                $invoice = Invoice::create([
                    'invoice_no' => $validated['invoice_no'],
                    'job_card_id' => $validated['job_card_id'],
                    'customer_id' => $validated['customer_id'],
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'discount_total' => $validated['discount_total'] ?? 0,
                    'advance_payment' => $validated['advance_payment'] ?? 0,
                    'status' => 'finalized',
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(7),
                    'remarks' => $validated['remarks'],
                ]);
            }

            // Create invoice items
            $invoiceItems = [];
            foreach ($validated['items'] as $item) {
                $invoiceItems[] = [
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_type' => $item['discount_type'],
                    'discount_value' => $item['discount_value'],
                    'line_total' => $item['line_total'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            InvoiceItem::insert($invoiceItems);

            DB::commit();

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

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing invoice: ' . $e->getMessage(), [
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

    public function viewInvoice(Request $request, $jobcard_id)
    {
        try {
            // Find the job card with all necessary relationships
            $jobCard = JobCard::with([
                'customer',
                'vehicle.model',
                'serviceJobCard.oilItem.product',
                'serviceJobCard.oilFilterItem.product', 
                'serviceJobCard.drainPlugSealItem.product',
                'jobCardVehicleServices.vehicleService',
                'jobCardVehicleServices.vehicleServiceOption'
            ])->findOrFail($jobcard_id);

            // Get advance payment from URL parameter
            $advancePayment = $request->query('advance', 0);

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
                    'line_total' => $oil->selling_price,
                ];
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
                    'line_total' => $filter->selling_price,
                ];
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
            }

            // Prepare services items
            $servicesItems = [];
            foreach ($jobCard->jobCardVehicleServices->where('is_included', true) as $service) {
                $price = $service->vehicleServiceOption 
                    ? $service->vehicleServiceOption->price 
                    : ($service->vehicleService->base_price ?? 0);

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
            }

            // Combine all items for backward compatibility
            $invoiceItems = array_merge($partsItems, $servicesItems);

            // Calculate totals
            $partsTotal = collect($partsItems)->sum('line_total');
            $servicesTotal = collect($servicesItems)->sum('line_total');
            $subtotal = $partsTotal + $servicesTotal;

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
                    'phone' => $jobCard->customer->mobile,
                    'email' => $jobCard->customer->email ?? 'N/A',
                    'address' => $jobCard->customer->address,
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

            return Inertia::render('job-card/invoice', [
                'invoice' => $invoice
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading invoice: ' . $e->getMessage(), [
                'job_card_id' => $jobcard_id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to load invoice data.');
        }
    }

    public function storeInvoice(Request $request)
    {
        Log::info('invoice print',[
            'req'=>$request
        ]);
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

            DB::beginTransaction();

            // Check if invoice already exists for this job card
            $existingInvoice = Invoice::where('job_card_id', $validated['job_card_id'])->first();
            
            if ($existingInvoice) {
                // Update existing invoice
                $invoice = $existingInvoice;
                $invoice->update([
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'discount_total' => $validated['discount_total'] ?? 0,
                    'advance_payment' => $validated['advance_payment'] ?? 0,
                    'status' => 'finalized',
                    'remarks' => $validated['remarks'],
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(7),
                ]);

                // Delete existing items
                $invoice->items()->delete();
            } else {
                // Create new invoice
                $invoice = Invoice::create([
                    'invoice_no' => $validated['invoice_no'],
                    'job_card_id' => $validated['job_card_id'],
                    'customer_id' => $validated['customer_id'],
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'discount_total' => $validated['discount_total'] ?? 0,
                    'advance_payment' => $validated['advance_payment'] ?? 0,
                    'status' => 'finalized',
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(7),
                    'remarks' => $validated['remarks'],
                ]);
            }

            // Create invoice items
            $invoiceItems = [];
            foreach ($validated['items'] as $item) {
                $invoiceItems[] = [
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_type' => $item['discount_type'],
                    'discount_value' => $item['discount_value'],
                    'line_total' => $item['line_total'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            InvoiceItem::insert($invoiceItems);

            DB::commit();

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

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing invoice: ' . $e->getMessage(), [
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
}
