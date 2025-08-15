<?php

use App\Http\Controllers\GRN\GrnController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/grn')
        ->name('dashboard.grn.')
        ->group(function () {

            Route::get('/', [GrnController::class, 'index'])->name('index');
            Route::get('/create/{purchaseOrder_id}', [GrnController::class, 'create'])->name('create');
            Route::post('/store', [GrnController::class, 'store'])->name('store');
            Route::get('/{grn_id}/edit', [GrnController::class, 'edit'])->name('edit');
            Route::put('/{stock_id}/update', [GrnController::class, 'update'])->name('update');
            Route::delete('/{grn}', [GrnController::class, 'destroy'])->name('destroy');

            Route::get('/suppliers/search', [GrnController::class, 'searchSuppliers'])
                ->name('suppliers.search');
        });
});
