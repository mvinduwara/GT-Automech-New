<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Expense Report - GT Automech</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; font-size: 12px; color: #333; }
        .page { padding: 30px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { border: none; padding: 0; }
        .brand h1 { margin: 0; font-size: 24px; color: #000; }
        .brand p { margin: 2px 0; color: #666; font-size: 11px; }
        .report-info { text-align: right; }
        .report-info h2 { margin: 0; font-size: 18px; color: #333; }
        .report-info p { margin: 2px 0; color: #888; font-size: 10px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f4f4f4; border-bottom: 2px solid #333; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .totals { margin-top: 20px; float: right; width: 250px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .grand-total { border-top: 2px solid #333; margin-top: 5px; padding-top: 10px; font-size: 14px; font-weight: bold; }
        
        .footer { position: fixed; bottom: 30px; left: 30px; right: 30px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; color: #999; font-size: 10px; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="brand">
                        <h1>GT Automech</h1>
                        <p>186/2, Raigama Junction, Kothalawala, Bandaragama</p>
                        <p>www.gtdrive.lk • info@gtdrive.lk • +94 77 409 8580</p>
                    </td>
                    <td class="report-info">
                        <h2>EXPENSE REPORT</h2>
                        <p>Period: {{ $startDate }} - {{ $endDate }}</p>
                        <p>Generated: {{ $generatedAt }}</p>
                    </td>
                </tr>
            </table>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">Date</th>
                    <th style="width: 20%;">Category</th>
                    <th style="width: 35%;">Description</th>
                    <th style="width: 15%;">Method</th>
                    <th style="width: 15%;" class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($expenses as $expense)
                    <tr>
                        <td>{{ $expense->date->format('d M Y') }}</td>
                        <td>{{ $expense->account->name }}</td>
                        <td>{{ $expense->description }}</td>
                        <td>{{ ucfirst($expense->payment_method) }}</td>
                        <td class="text-right">LKR {{ number_format($expense->amount, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row grand-total">
                <span>TOTAL AMOUNT</span>
                <span>LKR {{ number_format($totalAmount, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            Thank you for using GT-ERP System. This is a system-generated report.
        </div>
    </div>
</body>
</html>
