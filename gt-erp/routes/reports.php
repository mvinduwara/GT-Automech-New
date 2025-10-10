<?php

use App\Http\Controllers\Report\FinancialReportController;
use App\Http\Controllers\Reports\EmployeeReportController;
use App\Http\Controllers\Reports\PettyCashReportController;
use App\Http\Controllers\Reports\PettyCashVoucherReportController;
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

        // Petty Cash Report Routes
        Route::get('/petty-cash', [PettyCashReportController::class, 'index'])->name('petty_cash');
        Route::get('/petty-cash/download', [PettyCashReportController::class, 'download'])->name('petty_cash.download');

        Route::get('/petty-cash-vouchers/download', [PettyCashVoucherReportController::class, 'download'])
            ->name('petty_cash_vouchers.download');


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
    });
});
