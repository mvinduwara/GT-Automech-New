<!DOCTYPE html>
<html>
<head>
    <title>Attendance Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; }
        .meta { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Attendance Report</h1>
    <div class="meta">
        <p>Generated on: {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
                <th>Late (min)</th>
                <th>Overtime (min)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($attendances as $attendance)
            <tr>
                <td>{{ $attendance->date }}</td>
                <td>{{ $attendance->employee->first_name }} {{ $attendance->employee->last_name }}</td>
                <td>{{ $attendance->clock_in ?? '-' }}</td>
                <td>{{ $attendance->clock_out ?? '-' }}</td>
                <td>{{ ucfirst($attendance->status) }}</td>
                <td>{{ $attendance->late_minutes }}</td>
                <td>{{ $attendance->overtime_minutes }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
