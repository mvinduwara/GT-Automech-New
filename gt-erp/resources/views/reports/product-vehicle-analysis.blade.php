<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Product-Vehicle Analysis Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 5px 0; color: #666; }
        .footer { position: fixed; bottom: 0; width: 100%; font-size: 9px; text-align: center; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Product-Vehicle Analysis Report</h1>
        <p>Generated on: {{ $generatedAt }}</p>
        @if(!empty($filters))
            <p style="font-size: 11px; margin-top: 5px;">
                <strong>Filters Applied:</strong> 
                @foreach($filters as $label => $value)
                    <span style="margin-right: 10px;">{{ $label }}: {{ $value }}</span>
                @endforeach
            </p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">Part Number</th>
                <th style="width: 20%">Product Name</th>
                <th style="width: 10%">Brand</th>
                <th style="width: 10%">Models Count</th>
                <th style="width: 30%">Compatible Models</th>
                <th style="width: 7%">Stock</th>
                <th style="width: 8%">Price</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td>{{ $product['part_number'] }}</td>
                <td>{{ $product['name'] }}</td>
                <td>{{ $product['brand'] }}</td>
                <td style="text-align: center">{{ $product['models_count'] }}</td>
                <td>{{ $product['models'] }}</td>
                <td style="text-align: right">{{ $product['stock'] }}</td>
                <td style="text-align: right">{{ number_format($product['price'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page <span class="pagenum"></span>
    </div>
</body>
</html>
