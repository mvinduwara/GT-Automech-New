<?php

use App\Http\Controllers\PettyCash\PettyCashController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->group(function () {

            Route::get('/', [PettyCashController::class, 'index'])->name('index');
            Route::get('/create', [PettyCashController::class, 'create'])->name('create');
            // Route::post('/store', [PettyCashController::class, 'store'])->name('store');
            Route::get('/{stock_id}/edit', [PettyCashController::class, 'edit'])->name('edit');
            // Route::put('/{stock_id}/update', [PettyCashController::class, 'update'])->name('update');

        });
});
