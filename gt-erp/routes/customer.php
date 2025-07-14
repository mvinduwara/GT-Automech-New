<?php

use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Product\BrandController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\NewProductController;
use App\Http\Controllers\Product\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_cashier'])->group(function () {
    Route::prefix('dashboard/customer')
        ->name('dashboard.customer.')
        ->group(function () {

            Route::get('/', [CustomerController::class, 'index'])->name('index');
            Route::get('/create', [CustomerController::class, 'create'])->name('create');
            Route::get('/{customer_id}/edit', [CustomerController::class, 'edit'])->name('edit');

        });
});
