<?php

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
