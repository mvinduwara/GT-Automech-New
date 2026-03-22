<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>GT Automech • Petty Cash Daily Report {{ $summary['date'] }}</title>
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

        .section-title {
            margin-top: 20px;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            text-transform: uppercase;
        }

        .summary-grid {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .summary-card {
            border: 1px solid #eee;
            padding: 10px;
            text-align: center;
            width: 20%;
        }

        .summary-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .summary-value {
            font-size: 16px;
            font-weight: bold;
        }

        .vouchers-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .vouchers-table th {
            border-bottom: 2px solid #000;
            text-align: left;
            padding: 8px 6px;
            font-size: 11px;
            text-transform: uppercase;
            background-color: #f9f9f9;
        }

        .vouchers-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }

        .right {
            text-align: right;
        }

        .center {
            text-align: center;
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

        .badge-finalized {
            background-color: #f0fdf4;
            color: #166534;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-pending {
            background-color: #fefce8;
            color: #854d0e;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <table class="header-table">
        <tr>
            <td width="60">
                <img src="{{ public_path('assets/img/gt-nav.png') }}" alt="GT Logo" class="brand-logo">
            </td>
            <td class="brand-info">
                <h1>GT Automech</h1>
                <p>186/2, Raigama Junction, Kothalawala, Bandaragama</p>
                <p>www.gtdrive.lk • info@gtdrive.lk • +94 77 409 8580</p>
            </td>
            <td class="meta-info">
                <h2>DAILY REPORT</h2>
                <div style="font-size: 14px; font-weight: bold; padding-bottom: 5px;">{{ \Carbon\Carbon::parse($summary['date'])->format('d M Y') }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Summary Observations</div>
    <table class="summary-grid">
        <tr>
            <td class="summary-card">
                <div class="summary-label">Vouchers</div>
                <div class="summary-value">{{ $summary['voucher_count'] }}</div>
            </td>
            <td class="summary-card" style="background-color: #faf5ff;">
                <div class="summary-label" style="color: #7e22ce;">Replenished</div>
                <div class="summary-value" style="color: #7e22ce;">LKR {{ number_format($summary['total_replenished'], 2) }}</div>
            </td>
            <td class="summary-card">
                <div class="summary-label">Total Requested</div>
                <div class="summary-value">LKR {{ number_format($summary['total_requested'], 2) }}</div>
            </td>
            <td class="summary-card" style="background-color: #f0f9ff;">
                <div class="summary-label" style="color: #0369a1;">Total Spent</div>
                <div class="summary-value" style="color: #0369a1;">LKR {{ number_format($summary['total_spent'], 2) }}</div>
            </td>
            <td class="summary-card" style="background-color: #f0fdf4;">
                <div class="summary-label" style="color: #166534;">Total Balance</div>
                <div class="summary-value" style="color: #166534;">LKR {{ number_format($summary['total_balance'], 2) }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Detailed Voucher List</div>
    <table class="vouchers-table">
        <thead>
            <tr>
                <th width="100">Voucher #</th>
                <th>Payee Name</th>
                <th class="right">Requested</th>
                <th class="right">Spent</th>
                <th class="right">Balance</th>
                <th class="center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($vouchers as $voucher)
            <tr>
                <td style="font-weight: bold;">{{ $voucher->voucher_number }}</td>
                <td>{{ $voucher->name }}</td>
                <td class="right">{{ number_format($voucher->requested_amount, 2) }}</td>
                <td class="right">{{ number_format($voucher->actual_amount, 2) }}</td>
                <td class="right">{{ number_format($voucher->balance_amount, 2) }}</td>
                <td class="center">
                    @if($voucher->finalized_at)
                    <span class="badge-finalized">FINALIZED</span>
                    @else
                    <span class="badge-pending">{{ strtoupper($voucher->status) }}</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        GT Automech • Systematic Performance • For inquiries contact +94 77 409 8580
        <br>
        <span style="font-size: 9px; color: #999;">Generated on {{ now()->format('Y-m-d H:i:s') }}</span>
    </div>
</body>

</html>
