<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Customer Reviews Export</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .date { text-align: right; margin-bottom: 15px; font-size: 10px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .star { font-size: 14px; color: #fbbf24; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Customer Online Reviews</h2>
    </div>
    <div class="date">
        Generated on: {{ date('Y-m-d H:i:s') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Vehicle No</th>
                <th>Rating</th>
                <th>Feedback</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $review)
                <tr>
                    <td>{{ $review->created_at ? $review->created_at->format('Y-m-d') : 'N/A' }}</td>
                    <td>{{ $review->invoice->customer->name ?? 'N/A' }}</td>
                    <td>{{ $review->invoice->customer->mobile ?? 'N/A' }}</td>
                    <td>{{ $review->jobCard->vehicle->vehicle_no ?? 'N/A' }}</td>
                    <td>{{ $review->rating }}/5</td>
                    <td>{{ $review->suggestions ?? 'No comments' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center;">No reviews found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
