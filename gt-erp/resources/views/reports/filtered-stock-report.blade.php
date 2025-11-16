<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Filtered Stock Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            margin: 15px;
        }

        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #2d3748;
            padding-bottom: 10px;
        }

        .header h1 {
            font-size: 20px;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #4a5568;
            margin-top: 5px;
        }

        .filter-info {
            background-color: #edf2f7;
            padding: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #4299e1;
            border-radius: 3px;
        }

        .filter-info h3 {
            font-size: 11px;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .filter-item {
            display: inline-block;
            margin-right: 15px;
            font-size: 9px;
        }

        .filter-item strong {
            color: #2d3748;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #cbd5e0;
            padding: 6px 4px;
            text-align: left;
            font-size: 9px;
        }

        th {
            background-color: #2d3748;
            color: white;
            font-weight: bold;
            text-align: center;
        }

        tr:nth-child(even) {
            background-color: #f7fafc;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .low-stock {
            color: #e53e3e;
            font-weight: bold;
        }

        .stock-ok {
            color: #38a169;
        }

        .totals-row {
            background-color: #edf2f7 !important;
            font-weight: bold;
            border-top: 2px solid #2d3748;
        }

        .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e0;
            text-align: center;
            font-size: 8px;
            color: #718096;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Filtered Stock Report</h1>
        <div class="meta-info">
            <span>Generated: {{ $generatedAt }}</span>
            <span>By: {{ $generatedBy }}</span>
            <span>Total Products: {{ count($products) }}</span>
        </div>
    </div>

    @if (!empty($filterInfo))
        <div class="filter-info">
            <h3>Applied Filters:</h3>
            @if (isset($filterInfo['category']))
                <div class="filter-item">
                    <strong>Category:</strong> {{ $filterInfo['category'] }}
                </div>
            @endif
            @if (isset($filterInfo['brand']))
                <div class="filter-item">
                    <strong>Brand:</strong> {{ $filterInfo['brand'] }}
                </div>
            @endif
            @if (isset($filterInfo['product_count']))
                <div class="filter-item">
                    <strong>Specific Products:</strong> {{ $filterInfo['product_count'] }} selected
                </div>
            @endif
            @if (!isset($filterInfo['category']) && !isset($filterInfo['brand']) && !isset($filterInfo['product_count']))
                <div class="filter-item">
                    <strong>Filter:</strong> All Products
                </div>
            @endif
        </div>
    @endif

    <table>
        <thead>
            <tr>
                <th style="width: 3%;">#</th>
                <th style="width: 10%;">Part Number</th>
                <th style="width: 15%;">Product Name</th>
                <th style="width: 10%;">Category</th>
                <th style="width: 10%;">Brand</th>
                <th style="width: 5%;">UoM</th>
                <th style="width: 7%;">Qty in Stock</th>
                <th style="width: 7%;">Reorder Level</th>
                <th style="width: 8%;">Avg Buy Price</th>
                <th style="width: 8%;">Avg Sell Price</th>
                <th style="width: 10%;">Inventory Value</th>
                <th style="width: 7%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($products as $index => $product)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $product['part_number'] }}</td>
                    <td>{{ $product['name'] }}</td>
                    <td>{{ $product['category'] }}</td>
                    <td>{{ $product['brand'] }}</td>
                    <td class="text-center">{{ $product['uom'] }}</td>
                    <td class="text-right"><strong>{{ number_format($product['current_stock']) }}</strong></td>
                    <td class="text-right">{{ number_format($product['reorder_level']) }}</td>
                    <td class="text-right">Rs. {{ number_format($product['avg_buying_price'], 2) }}</td>
                    <td class="text-right">Rs. {{ number_format($product['avg_selling_price'], 2) }}</td>
                    <td class="text-right">Rs. {{ number_format($product['inventory_value'], 2) }}</td>
                    <td class="text-center {{ $product['is_low_stock'] ? 'low-stock' : 'stock-ok' }}">
                        {{ $product['is_low_stock'] ? 'LOW STOCK' : 'OK' }}
                    </td>
                </tr>
            @endforeach

            <!-- Totals Row -->
            <tr class="totals-row">
                <td colspan="6" class="text-right">TOTALS:</td>
                <td class="text-right">{{ number_format($totals['total_stock']) }}</td>
                <td colspan="3"></td>
                <td class="text-right">Rs. {{ number_format($totals['total_inventory_value'], 2) }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>This is a system-generated report. No signature required.</p>
        <p>Confidential - For Internal Use Only</p>
    </div>
</body>

</html>
