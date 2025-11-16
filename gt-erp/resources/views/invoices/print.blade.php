<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GT Automech • Invoice {{ $invoice->invoice_no }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-size: 13px;
        }

        .invoice {
            width: 210mm;
            min-height: 297mm;
            margin: auto;
            padding: 20mm;
            box-sizing: border-box;
        }

        .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
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
            font-size: 12px;
        }

        .meta {
            text-align: right;
        }

        .meta h2 {
            margin: 0;
            font-size: 22px;
        }

        .meta .badge {
            font-weight: bold;
        }

        .section {
            margin-bottom: 20px;
        }

        .section h3 {
            margin-bottom: 6px;
            font-size: 14px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }

        .kv {
            display: grid;
            grid-template-columns: 120px 1fr;
            row-gap: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table thead th {
            border-bottom: 2px solid #000;
            text-align: left;
            padding: 6px;
            font-size: 12px;
            text-transform: uppercase;
        }

        table tbody td {
            padding: 6px;
            border-bottom: 1px solid #ccc;
        }

        .right {
            text-align: right;
        }

        .totals {
            max-width: 300px;
            margin-left: auto;
        }

        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
        }

        .totals .grand {
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #000;
            margin-top: 4px;
            padding-top: 6px;
        }

        .footer {
            border-top: 1px solid #000;
            padding-top: 10px;
            font-size: 12px;
            margin-top: 40px;
            text-align: center;
        }

        @media print {
            body {
                margin: 0;
            }
        }
    </style>
</head>

<body>
    <div class="invoice">
        <div class="header">
            <div class="brand">
                <img src="{{ asset('assets/img/gt-nav.png') }}" alt="GT Logo">
                <div>
                    <h1>GT Automech</h1>
                    <p>186/2, Raigama Junction, Kothalawala, Bandaragama</p>
                    <p>www.gtdrive.lk • info@gtdrive.lk • +94 77 409 8580</p>
                </div>
            </div>
            <div class="meta">
                <h2>INVOICE</h2>
                <div class="badge">#{{ $invoice->invoice_no }}</div>
                <div>Issued: {{ $invoice->invoice_date->format('d M Y') }}</div>
                <div>Due: {{ $invoice->due_date->format('d M Y') }}</div>
            </div>
        </div>

        <div class="section">
            <h3>Bill To</h3>
            <div class="kv">
                <span>Name</span><span>{{ $invoice->customer->name }}</span>
                <span>Phone</span><span>{{ $invoice->customer->phone }}</span>
                <span>Email</span><span>{{ $invoice->customer->email ?? 'N/A' }}</span>
                <span>Address</span><span>{{ $invoice->customer->address ?? 'N/A' }}</span>
            </div>
        </div>

        <div class="section">
            <h3>Vehicle</h3>
            <div class="kv">
                <span>Vehicle</span><span>{{ $invoice->jobCard->vehicle->name ?? 'N/A' }}</span>
                <span>Job Card</span><span>#{{ $invoice->jobCard->job_card_no }}</span>
                <span>Odometer</span><span>{{ $invoice->jobCard->mileage ?? 'N/A' }} km</span>
            </div>
        </div>

        @if ($invoice->remarks)
            <div class="section">
                <h3>Notes</h3>
                <p>{{ $invoice->remarks }}</p>
            </div>
        @endif

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="right">Qty</th>
                    <th class="right">Unit Price</th>
                    <th class="right">Discount</th>
                    <th class="right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoice->items as $item)
                    <tr>
                        <td>{{ $item->description }}</td>
                        <td class="right">{{ $item->quantity }}</td>
                        <td class="right">LKR {{ number_format($item->unit_price, 2) }}</td>
                        <td class="right">
                            @if ($item->discount_type)
                                {{ ucfirst($item->discount_type) }}
                                @if ($item->discount_type !== 'foc')
                                    ({{ $item->discount_value }})
                                @endif
                            @else
                                -
                            @endif
                        </td>
                        <td class="right">LKR {{ number_format($item->line_total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <div class="row"><span>Subtotal</span><span>LKR {{ number_format($invoice->subtotal, 2) }}</span></div>
            @if ($invoice->discount_total > 0)
                <div class="row"><span>Discount</span><span>-LKR
                        {{ number_format($invoice->discount_total, 2) }}</span></div>
            @endif
            @if ($invoice->advance_payment > 0)
                <div class="row"><span>Advance Payment</span><span>-LKR
                        {{ number_format($invoice->advance_payment, 2) }}</span></div>
            @endif
            <div class="row grand"><span>Amount Due</span><span>LKR {{ number_format($invoice->remaining, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            Thank you for choosing <strong>GT Automech</strong>. For inquiries, contact us at +94 77 000 0000
        </div>
    </div>
</body>

</html>
