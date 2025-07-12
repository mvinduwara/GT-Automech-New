<?php

use App\Http\Controllers\Stock\StockController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/stock')
        ->name('dashboard.stock.')
        ->group(function () {

            Route::get('/', [StockController::class, 'index'])->name('index'); 
            Route::get('/create', [StockController::class, 'create'])->name('create');
            // Route::post('/store', [StockController::class, 'store'])->name('store');
            Route::get('/{stock_id}/edit', [StockController::class, 'edit'])->name('edit');
            // Route::put('/{stock_id}/update', [StockController::class, 'update'])->name('update');

        });
});