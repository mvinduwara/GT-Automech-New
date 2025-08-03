<?php

use App\Http\Controllers\JobCard\JobCardController;
use App\Http\Controllers\OpenJobCardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_service_manager'])->group(function () {
    Route::prefix('dashboard/job-card')
        ->name('dashboard.job-card.')
        ->group(function () {

            // Route::get('/{any?}', function () {
            //     return redirect()->route('dashboard');
            // })->where('any', '.*');

            Route::get('/', [JobCardController::class, 'index'])->name('index');
            Route::get('/open', [OpenJobCardController::class, 'index'])->name('open');
            Route::get('/invoice', [OpenJobCardController::class, 'invoice'])->name('invoice');
            Route::get('/create', [JobCardController::class, 'create'])->name('create');
            Route::post('/store', [JobCardController::class, 'store'])->name('store');
            Route::get('/{jobcard_id}/edit', [JobCardController::class, 'edit'])->name('edit');
            Route::put('/{stock_id}/update', [JobCardController::class, 'update'])->name('update');

        });
});
