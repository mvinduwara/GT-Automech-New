<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Top Selling Products Report - GT Automech</title>
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
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f4f4f4; border-bottom: 2px solid #333; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        
        .status-low { color: #d9534f; font-weight: bold; }
        .status-ok { color: #5cb85c; }
        
        .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; text-align: center; color: #999; font-size: 10px; }
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
                        <h2>TOP SELLING PRODUCTS</h2>
                        <p>Period: {{ $startDate }} - {{ $endDate }}</p>
                        <p>Generated: {{ $generatedAt }}</p>
                    </td>
                </tr>
            </table>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">Part Number</th>
                    <th style="width: 35%;">Product Name</th>
                    <th style="width: 15%;">Brand</th>
                    <th style="width: 10%;" class="text-right">Units Sold</th>
                    <th style="width: 15%;" class="text-right">Current Stock</th>
                    <th style="width: 10%;" class="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($products as $product)
                    <tr>
                        <td>{{ $product->part_number }}</td>
                        <td class="font-bold">{{ $product->name }}</td>
                        <td>{{ $product->brand_name ?? '-' }}</td>
                        <td class="text-right">{{ number_format($product->total_sold) }}</td>
                        <td class="text-right">{{ number_format($product->current_stock) }}</td>
                        <td class="text-center">
                            @if($product->is_low_stock)
                                <span class="status-low">Low Stock</span>
                            @else
                                <span class="status-ok">OK</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            <p>Thank you for choosing GT Automech. This is a system-generated report.</p>
        </div>
    </div>
</body>
</html>
