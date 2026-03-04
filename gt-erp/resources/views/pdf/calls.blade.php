<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Call List Export</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; }
        .date { text-align: right; margin-bottom: 15px; font-size: 10px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f4f4f4; }
        .badge { padding: 2px 5px; border-radius: 3px; font-size: 10px; text-transform: capitalize; border: 1px solid #ddd; }
        .pending { color: #888; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Feedback Call List</h2>
    </div>
    <div class="date">
        Generated on: {{ date('Y-m-d H:i:s') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Vehicle No</th>
                <th>Status</th>
                <th>Admin Rating</th>
                <th>Admin Feedback</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $invoice)
                <tr>
                    <td>{{ $invoice->created_at ? $invoice->created_at->format('Y-m-d') : 'N/A' }}</td>
                    <td style="font-family: monospace;">{{ $invoice->invoice_no }}</td>
                    <td>{{ $invoice->customer->name ?? 'N/A' }}</td>
                    <td>{{ $invoice->customer->mobile ?? 'N/A' }}</td>
                    <td>{{ $invoice->jobCard->vehicle->vehicle_no ?? 'N/A' }}</td>
                    <td><span class="badge">{{ $invoice->status }}</span></td>
                    <td>
                        @if($invoice->manual_rating)
                            {{ $invoice->manual_rating }}/5
                        @else
                            <span class="pending">Pending</span>
                        @endif
                    </td>
                    <td>{{ $invoice->manual_feedback ?? '' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center;">No invoices needing calls found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
