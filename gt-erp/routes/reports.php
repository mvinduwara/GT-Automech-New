<?php

use App\Http\Controllers\Reports\EmployeeReportController;
use App\Http\Controllers\Reports\PettyCashReportController;
use App\Http\Controllers\Reports\StockReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard/reports')
        ->name('dashboard.reports.')
        ->group(function () {

            Route::get('/stock', [StockReportController::class, 'index'])->name('stock');
            Route::get('/stock/download', [StockReportController::class, 'download'])
                ->name('stock.download');
        });
});

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard/reports')
        ->name('dashboard.reports.')
        ->group(function () {

            // Stock Report Routes
            Route::get('/stock', [StockReportController::class, 'index'])->name('stock');
            Route::get('/stock/download', [StockReportController::class, 'download'])
                ->name('stock.download');

            // Petty Cash Report Routes
            Route::get('/petty-cash', [PettyCashReportController::class, 'index'])->name('petty_cash');
            Route::get('/petty-cash/download', [PettyCashReportController::class, 'download'])
                ->name('petty_cash.download');
        });
});

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard/reports')
        ->name('dashboard.reports.')
        ->group(function () {

            // Employee Report Routes
            Route::get('/employee', [EmployeeReportController::class, 'index'])->name('employee');
            Route::get('/employee/download', [EmployeeReportController::class, 'download'])
                ->name('employee.download');
        });
});
