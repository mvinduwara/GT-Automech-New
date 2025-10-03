<?php

use App\Http\Controllers\Invoice\InvoiceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/invoice')
        ->name('dashboard.invoice.')
        ->group(function () {

            Route::get('/', [InvoiceController::class, 'index'])->name('index');
            Route::get('/create', [InvoiceController::class, 'create'])->name('create');
            Route::get('/{invoice_id}/view', [InvoiceController::class, 'view'])->name('view');
            // Route::post('/store', [InvoiceController::class, 'store'])->name('store');
            // Route::get('/{invoice_id}/edit', [InvoiceController::class, 'edit'])->name('edit');
            // Route::put('/{stock_id}/update', [InvoiceController::class, 'update'])->name('update');

        });
});
