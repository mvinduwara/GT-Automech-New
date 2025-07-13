<?php

use App\Http\Controllers\JobCard\JobCardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/grn')
        ->name('dashboard.grn.')
        ->group(function () {

            Route::get('/', [JobCardController::class, 'index'])->name('index');
            Route::get('/create', [JobCardController::class, 'create'])->name('create');
            // Route::post('/store', [JobCardController::class, 'store'])->name('store');
            Route::get('/{stock_id}/edit', [JobCardController::class, 'edit'])->name('edit');
            // Route::put('/{stock_id}/update', [JobCardController::class, 'update'])->name('update');

        });
});
