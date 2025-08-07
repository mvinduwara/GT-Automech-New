<?php

use App\Http\Controllers\PettyCash\PettyCashController;
use App\Http\Controllers\PettyCashItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->group(function () {
            Route::get('/', [PettyCashController::class, 'index'])->name('index');
            
            // Add the item update route here (accessible to all authenticated users)
            Route::patch('/items/{item}/update-checked', [PettyCashItemController::class, 'updateCheckedStatus'])
                ->name('item.update-checked');
        });
});

Route::middleware(['auth', 'is_cashier'])->group(function () {
    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->group(function () {
            Route::get('/create', [PettyCashController::class, 'create'])->name('create');
            Route::get('/{voucher_number}/edit', [PettyCashController::class, 'edit'])->name('edit');
            Route::post('/', [PettyCashController::class, 'store'])->name('store');
            Route::delete('/{voucher_number}', [PettyCashController::class, 'destroy'])->name('destroy');
        });
});