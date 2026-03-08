<?php

use App\Http\Controllers\Reports\FinancialReportController;
use App\Http\Controllers\Reports\EmployeeReportController;
use App\Http\Controllers\Reports\PettyCashReportController;
use App\Http\Controllers\Reports\PettyCashVoucherReportController;
use App\Http\Controllers\Reports\PettyCashDailyReportController;
use App\Http\Controllers\Reports\PurchaseOrderItemReportController;
use App\Http\Controllers\Reports\PurchaseOrderReportController;
use App\Http\Controllers\Reports\StockReportController;
use App\Http\Controllers\Reports\SupplierReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard/reports')->name('dashboard.reports.')->group(function () {

        // Stock Report Routes
        Route::get('/stock', [StockReportController::class, 'index'])->name('stock');
        Route::get('/stock/download', [StockReportController::class, 'download'])->name('stock.download');

        Route::get('/stock/filters', [StockReportController::class, 'getFilters'])->name('stock.filters');
        Route::get('/stock/filtered/download', [StockReportController::class, 'downloadFiltered'])->name('stock.filtered.download');

        // Petty Cash Report Routes
        Route::get('/petty-cash', [PettyCashReportController::class, 'index'])->name('petty_cash');
        Route::get('/petty-cash/download', [PettyCashReportController::class, 'download'])->name('petty_cash.download');

        Route::get('/petty-cash-vouchers/download', [PettyCashVoucherReportController::class, 'download'])
            ->name('petty_cash_vouchers.download');

        // Petty Cash Daily Report Routes
        Route::get('/petty-cash-daily', [PettyCashDailyReportController::class, 'index'])->name('petty_cash_daily');
        Route::get('/petty-cash-daily/export', [PettyCashDailyReportController::class, 'exportExcel'])->name('petty_cash_daily.export');
        Route::get('/petty-cash-daily/{date}', [PettyCashDailyReportController::class, 'show'])->name('petty_cash_daily.show');
        Route::get('/petty-cash-daily/{date}/export', [PettyCashDailyReportController::class, 'exportDayExcel'])->name('petty_cash_daily.day_export');
        Route::get('/petty-cash-daily/{date}/download-pdf', [PettyCashDailyReportController::class, 'downloadDailyPdf'])->name('petty_cash_daily.download_pdf');


        // Employee Report Routes
        Route::get('/employee', [EmployeeReportController::class, 'index'])->name('employee');
        Route::get('/employee/download', [EmployeeReportController::class, 'download'])->name('employee.download');

        // Purchase Order Report Routes ✅
        Route::get('/purchase-order', [PurchaseOrderReportController::class, 'index'])->name('purchase_order');
        Route::get('/purchase-order/download', [PurchaseOrderReportController::class, 'download'])->name('purchase_order.download');

        Route::get('/purchase-order-items/download', [PurchaseOrderItemReportController::class, 'download'])
            ->name('purchase_order_items.download');


        // Supplier Report Routes
        Route::get('/supplier', [SupplierReportController::class, 'index'])->name('supplier');
        Route::get('/supplier/download', [SupplierReportController::class, 'download'])->name('supplier.download');

        Route::get('/profit-loss', [FinancialReportController::class, 'profitAndLoss'])->name('reports.profit-loss');
        // Product-Vehicle Analysis Routes
        Route::get('/product-vehicle-analysis', [App\Http\Controllers\Reports\ProductVehicleAnalysisController::class, 'index'])->name('product_vehicle_analysis');
        Route::get('/product-vehicle-analysis/download-excel', [App\Http\Controllers\Reports\ProductVehicleAnalysisController::class, 'exportExcel'])->name('product_vehicle_analysis.excel');
        Route::get('/product-vehicle-analysis/download-pdf', [App\Http\Controllers\Reports\ProductVehicleAnalysisController::class, 'exportPdf'])->name('product_vehicle_analysis.pdf');
    });
});
