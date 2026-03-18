<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Reports\AccountReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('dashboard/accounts')->name('dashboard.accounts.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('index');
    Route::post('/', [AccountController::class, 'store'])->name('store');
    Route::put('/{account}', [AccountController::class, 'update'])->name('update');
    Route::delete('/{account}', [AccountController::class, 'destroy'])->name('destroy');

    // Reports
    Route::get('/ledger-reports', [AccountReportController::class, 'index'])->name('reports');
});
