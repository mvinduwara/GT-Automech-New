<?php

use App\Http\Controllers\Stock\InventoryController;
use App\Http\Controllers\Stock\ProductController;
use App\Http\Controllers\Stock\StockController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard')
        ->name('dashboard.')
        ->group(function () {

            Route::get('/inventory', [InventoryController::class, 'index'])->name('index');

            Route::prefix('product')
                ->name('product.')
                ->group(function () {
                    Route::get('/', [ProductController::class, 'index'])->name('index');
                    Route::get('/create', [ProductController::class, 'create'])->name('create');
                    Route::post('/store', [ProductController::class, 'store'])->name('store');
                    Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
                    Route::post('/{product}/update', [ProductController::class, 'update'])->name('update');
                });

            Route::prefix('stock')
                ->name('stock.')
                ->group(function () {
                    Route::get('/', [StockController::class, 'index'])->name('index');
                    Route::get('/create', [StockController::class, 'create'])->name('create');
                    Route::post('/store', [StockController::class, 'store'])->name('store');
                    Route::get('/{stock}/edit', [StockController::class, 'edit'])->name('edit');
                    Route::post('/{stock}/update', [StockController::class, 'update'])->name('update');
                });
        });
});
