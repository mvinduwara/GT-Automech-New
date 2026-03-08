<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>GT Automech • Petty Cash Voucher {{ $voucher->voucher_number }}</title>
    <style>
        @page {
            margin: 15mm;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-size: 13px;
            line-height: 1.4;
        }

        .header-table {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .brand-logo {
            width: 60px;
            vertical-align: middle;
        }

        .brand-info {
            padding-left: 12px;
            vertical-align: middle;
        }

        .brand-info h1 {
            margin: 0;
            font-size: 20px;
            text-transform: uppercase;
        }

        .brand-info p {
            margin: 2px 0;
            font-size: 11px;
            color: #333;
        }

        .meta-info {
            text-align: right;
            vertical-align: bottom;
        }

        .meta-info h2 {
            margin: 0;
            font-size: 22px;
            color: #000;
        }

        .meta-info .badge {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
        }

        .section-title {
            margin-top: 20px;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            text-transform: uppercase;
        }

        .details-table {
            width: 100%;
            margin-bottom: 20px;
        }

        .details-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .label {
            width: 120px;
            font-weight: bold;
            color: #555;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th {
            border-bottom: 2px solid #000;
            text-align: left;
            padding: 8px 6px;
            font-size: 11px;
            text-transform: uppercase;
            background-color: #f9f9f9;
        }

        .items-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #eee;
        }

        .right {
            text-align: right;
        }

        .totals-container {
            width: 100%;
            margin-top: 10px;
        }

        .totals-table {
            width: 250px;
            margin-left: auto;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 4px 0;
        }

        .grand-total {
            font-weight: bold;
            font-size: 15px;
            border-top: 2px solid #000;
            padding-top: 8px !important;
            margin-top: 5px;
        }

        .signature-table {
            width: 100%;
            margin-top: 60px;
        }

        .signature-box {
            width: 30%;
            text-align: center;
            vertical-align: top;
        }

        .signature-line {
            border-top: 1px solid #000;
            margin: 0 10px 5px;
            padding-top: 5px;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            font-size: 10px;
            text-align: center;
            color: #666;
        }

        .placeholder-box {
            min-height: 120px;
            border: 1px dashed #bbb;
            background-color: #fafafa;
            display: table;
            width: 100%;
            text-align: center;
        }

        .placeholder-text {
            display: table-cell;
            vertical-align: middle;
            color: #999;
            font-style: italic;
        }
    </style>
</head>

<body>
    <table class="header-table">
        <tr>
            <td class="brand-info">
                <h1>GT Automech</h1>
                <p>186/2, Raigama Junction, Kothalawala, Bandaragama</p>
                <p>www.gtdrive.lk • info@gtdrive.lk • +94 77 409 8580</p>
            </td>
            <td class="meta-info">
                <h2>PETTY CASH</h2>
                <div class="badge">#{{ $voucher->voucher_number }}</div>
                <div style="font-size: 11px;">Date: {{ $voucher->date->format('d M Y') }}</div>
                <div style="font-size: 11px;">Status: {{ strtoupper($voucher->status) }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Payee & Request Details</div>
    <table class="details-table">
        <tr>
            <td class="label">Payee Name</td>
            <td>: {{ $voucher->name }}</td>
        </tr>
        <tr>
            <td class="label">Description</td>
            <td>: {{ $voucher->description ?? 'No description provided' }}</td>
        </tr>
        <tr>
            <td class="label">Requested By</td>
            <td>: {{ $voucher->requestedBy->name ?? 'N/A' }}</td>
        </tr>
        @if($voucher->approvedBy)
        <tr>
            <td class="label">Approved By</td>
            <td>: {{ $voucher->approvedBy->name }}</td>
        </tr>
        @endif
    </table>

    @if($voucher->items->count() > 0)
    <div class="section-title">Expenditure Breakdown</div>
    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="right" width="60">Qty</th>
                <th class="right" width="100">Unit Price</th>
                <th class="right" width="100">Total (LKR)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($voucher->items as $item)
            <tr>
                <td>{{ $item->item_description }}</td>
                <td class="right">{{ $item->quantity }}</td>
                <td class="right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="right">{{ number_format($item->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="section-title">Expenditure Breakdown</div>
    <div class="placeholder-box">
        <div class="placeholder-text">
            (Space for itemized breakdown and receipts upon return)
        </div>
    </div>
    @endif

    <div class="totals-container">
        <table class="totals-table">
            <tr>
                <td>Requested Amount</td>
                <td class="right">LKR {{ number_format($voucher->requested_amount, 2) }}</td>
            </tr>
            @if($voucher->actual_amount > 0)
            <tr>
                <td>Total Spent</td>
                <td class="right">LKR {{ number_format($voucher->actual_amount, 2) }}</td>
            </tr>
            <tr class="grand-total">
                <td>Balance Returned</td>
                <td class="right">LKR {{ number_format($voucher->balance_amount, 2) }}</td>
            </tr>
            @endif
        </table>
    </div>

    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <div class="signature-line"></div>
                <strong>Prepared By</strong>
                <div style="font-size: 10px;">{{ $voucher->requestedBy->name ?? 'N/A' }}</div>
            </td>
            <td class="signature-box">
                <div class="signature-line"></div>
                <strong>Approved By</strong>
                <div style="font-size: 10px;">{{ $voucher->approvedBy->name ?? '________________' }}</div>
            </td>
            <td class="signature-box">
                <div class="signature-line"></div>
                <strong>Receiver's Signature</strong>
                <div style="font-size: 10px;">(Employee/Payee)</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Thank you for choosing <strong>GT Automech</strong>. For inquiries, contact us at +94 77 409 8580
        <br>
        <span style="font-size: 9px; color: #999;">Printed on {{ now()->format('Y-m-d H:i:s') }}</span>
    </div>
</body>

</html>
