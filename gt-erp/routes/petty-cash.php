<?php

use App\Http\Controllers\PettyCash\PettyCashController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_cashier'])->group(function () {
    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->group(function () {

            Route::get('/', [PettyCashController::class, 'index'])->name('index');
            Route::get('/create', [PettyCashController::class, 'create'])->name('create');
            Route::post('/store', [PettyCashController::class, 'store'])->name('store');
            Route::get('/{voucher_number}/edit', [PettyCashController::class, 'edit'])->name('edit');
            // Route::put('/{stock_id}/update', [PettyCashController::class, 'update'])->name('update');
        });
});
