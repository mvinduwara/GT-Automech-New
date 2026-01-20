<?php

use App\Http\Controllers\Stock\BrandController;
use App\Http\Controllers\Stock\CategoryController;
use App\Http\Controllers\Stock\InventoryController;
use App\Http\Controllers\Stock\ProductController;
use App\Http\Controllers\Stock\StockController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard')
        ->name('dashboard.')
        ->group(function () {

            Route::get('/inventory', [InventoryController::class, 'index'])->name('index');

            Route::prefix('category')
                ->name('category.')
                ->group(function () {
                    Route::get('/', [CategoryController::class, 'index'])->name('index');
                    Route::post('/store', [CategoryController::class, 'store'])->name('store');
                    Route::post('/{category}/update', [CategoryController::class, 'update'])->name('update');
                });
            Route::prefix('brand')
                ->name('brand.')
                ->group(function () {
                    Route::get('/', [BrandController::class, 'index'])->name('index');
                    Route::post('/store', [BrandController::class, 'store'])->name('store');
                    Route::post('/{brand}/update', [BrandController::class, 'update'])->name('update');
                });
            Route::prefix('product')
                ->name('product.')
                ->group(function () {
                    Route::get('/', [ProductController::class, 'index'])->name('index');
                    Route::get('/create', [ProductController::class, 'create'])->name('create');
                    Route::post('/store', [ProductController::class, 'store'])->name('store');
                    Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
                    Route::post('/{product}/update', [ProductController::class, 'update'])->name('update');
                    Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
                });

            Route::prefix('stock')
                ->name('stock.')
                ->group(function () {
                    Route::get('/', [StockController::class, 'index'])->name('index');
                    Route::get('/create', [StockController::class, 'create'])->name('create');
                    Route::post('/store', [StockController::class, 'store'])->name('store');
                    Route::get('/{stock}/edit', [StockController::class, 'edit'])->name('edit');
                    Route::put('/{stock}/update', [StockController::class, 'update'])->name('update');
                    Route::delete('/{stock}', [StockController::class, 'destroy'])->name('destroy');
                    Route::get('/search-products', [StockController::class, 'searchProducts'])->name('search-products');
                });
        });
});
