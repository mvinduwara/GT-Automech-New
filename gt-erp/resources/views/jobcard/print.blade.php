<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GT Automech • Job Card {{ $jobCard->job_card_no }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-size: 12px;
        }

        .job-card {
            width: 210mm;
            margin: auto;
            padding: 15mm;
            box-sizing: border-box;
        }

        .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .brand {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .brand img {
            width: 60px;
            height: auto;
        }

        .brand h1 {
            margin: 0;
            font-size: 20px;
        }

        .brand p {
            margin: 2px 0;
            font-size: 10px;
        }

        .meta {
            text-align: right;
        }

        .meta h2 {
            margin: 0;
            font-size: 20px;
        }

        .meta .badge {
            font-weight: bold;
        }

        .section {
            margin-bottom: 15px;
        }

        .details-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }

        .details-row .section {
            flex: 1;
            margin-bottom: 0;
        }

        .section h3 {
            margin-bottom: 4px;
            font-size: 12px;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
        }

        .kv {
            display: grid;
            grid-template-columns: 70px 1fr;
            row-gap: 2px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        table thead th {
            border-bottom: 2px solid #000;
            text-align: left;
            padding: 4px;
            font-size: 10px;
            text-transform: uppercase;
        }

        table tbody td {
            padding: 4px;
            border-bottom: 1px solid #ccc;
        }

        .right {
            text-align: right;
        }

        .totals {
            max-width: 250px;
            margin-left: auto;
        }

        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
        }

        .totals .grand {
            font-weight: bold;
            font-size: 12px;
            border-top: 2px solid #000;
            margin-top: 4px;
            padding-top: 4px;
        }

        .footer {
            border-top: 1px solid #000;
            padding-top: 8px;
            font-size: 10px;
            margin-top: 30px;
            text-align: center;
        }

        .no-content {
            color: #888;
            font-style: italic;
        }

        @media print {
            @page {
                margin: 0;
                size: auto;
            }
            body {
                margin: 0;
            }
        }
    </style>
</head>

<body>
    <div class="job-card">
        <div class="header">
            <div class="brand">
                {{-- <img src="{{ asset('assets/img/gt-nav.png') }}" alt="GT Logo"> --}}
                <div>
                    <h1>GT Automech</h1>
                    <p>186/2, Raigama Junction, Kothalawala, Bandaragama</p>
                    <p>www.gtdrive.lk • info@gtdrive.lk • +94 77 409 8580</p>
                </div>
            </div>
            <div class="meta">
                <h2>JOB CARD</h2>
                <div class="badge">#{{ $jobCard->job_card_no }}</div>
                <div>Date: {{ \Carbon\Carbon::parse($jobCard->date)->format('d M Y') }}</div>
                <div>Status: {{ ucfirst($jobCard->status) }}</div>
            </div>
        </div>

        <div class="details-row">
            <div class="section">
                <h3>Customer Details</h3>
                <div class="kv">
                    <span>Name</span><span>{{ $jobCard->customer->title }} {{ $jobCard->customer->name }}</span>
                    <span>Phone</span><span>{{ $jobCard->customer->mobile }}</span>
                    <span>Address</span><span>{{ $jobCard->customer->address ?? 'N/A' }}</span>
                </div>
            </div>

            <div class="section">
                <h3>Vehicle Details</h3>
                <div class="kv">
                    <span>Vehicle</span><span>{{ $jobCard->vehicle->brand?->name }} {{ $jobCard->vehicle->model?->name }}</span>
                    <span>Reg. No</span><span>{{ $jobCard->vehicle->vehicle_no }}</span>
                    <span>Year</span><span>{{ $jobCard->vehicle->make_year }}</span>
                    <span>Odometer</span><span>{{ number_format($jobCard->mileage) }} km</span>
                </div>
            </div>

            <div class="section">
                <h3>Assigned Technicians</h3>
                <div class="kv">
                    <span>Mechanical</span><span>{{ $jobCard->mechanicalTechnician?->first_name ?? 'N/A' }}</span>
                    <span>AC</span><span>{{ $jobCard->acTechnician?->first_name ?? 'N/A' }}</span>
                    <span>Electronic</span><span>{{ $jobCard->electronicTechnician?->first_name ?? 'N/A' }}</span>
                </div>
            </div>
        </div>

        @if ($jobCard->remarks)
            <div class="section">
                <h3>Customer Remarks / Instructions</h3>
                <p>{{ $jobCard->remarks }}</p>
            </div>
        @endif

        <div class="section">
            <h3>Services Requested</h3>
            @if ($jobCard->jobCardVehicleServices->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Service Description</th>
                            <th class="right">Price (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($jobCard->jobCardVehicleServices as $service)
                            @if ($service->is_included)
                                <tr>
                                    <td>{{ $service->vehicleService->name }} - {{ $service->vehicleServiceOption->name }}</td>
                                    <td class="right">{{ number_format($service->total, 2) }}</td>
                                </tr>
                            @endif
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="no-content">No services added.</p>
            @endif
        </div>

        <div class="section">
            <h3>Parts & Products</h3>
            @if ($jobCard->jobCardProducts->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Part Number</th>
                            <th class="right">Qty</th>
                            <th class="right">Unit Price</th>
                            <th class="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($jobCard->jobCardProducts as $product)
                            <tr>
                                <td>{{ $product->stock->product->name }}</td>
                                <td>{{ $product->stock->product->part_number }}</td>
                                <td class="right">{{ $product->quantity }}</td>
                                <td class="right">{{ number_format($product->unit_price, 2) }}</td>
                                <td class="right">{{ number_format($product->total, 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="no-content">No products added.</p>
            @endif
        </div>

        <div class="section">
            <h3>Additional Charges</h3>
            @if ($jobCard->jobCardCharges->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="right">Total (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($jobCard->jobCardCharges as $charge)
                            <tr>
                                <td>{{ $charge->name }}</td>
                                <td class="right">{{ number_format($charge->total, 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="no-content">No additional charges.</p>
            @endif
        </div>

        <div class="totals">
            <div class="row grand">
                <span>Estimated Total</span>
                <span>LKR {{ number_format($jobCard->grand_total, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing <strong>GT Automech</strong>. This is a work order, not a final bill.</p>
            <p>Service Advisor: {{ $jobCard->user->name }}</p>
        </div>
    </div>
    <script>
        window.onload = function() {
            window.print();
        };
        window.onafterprint = function() {
            window.close();
        };
    </script>
</body>

</html>
