<?php

use App\Http\Controllers\Invoice\InvoiceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/invoice')
        ->name('dashboard.invoice.')
        ->group(function () {
            Route::get('/', [InvoiceController::class, 'index'])->name('index');
            Route::get('/create', [InvoiceController::class, 'create'])->name('create');
            Route::post('/{jobCard}/store', [InvoiceController::class, 'store'])->name('store');
            Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
            Route::patch('/{invoice}/payment', [InvoiceController::class, 'updatePayment'])->name('payment');
            Route::patch('/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('cancel');
        });
});
