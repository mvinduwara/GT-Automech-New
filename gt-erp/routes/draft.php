<?php

use App\Http\Controllers\Product\BrandController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\NewProductController;
use App\Http\Controllers\Product\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/products')
        ->name('dashboard.products.')
        ->group(function () {

            Route::get('/', [ProductController::class, 'index'])->name('index'); // Or move to NewProductController
            Route::get('/create', [NewProductController::class, 'create'])->name('create');
            Route::post('/store', [NewProductController::class, 'store'])->name('store');
            Route::get('/{product}/edit', [NewProductController::class, 'edit'])->name('edit');
            Route::put('/{product}/update', [NewProductController::class, 'update'])->name('update');

        });
});
