<?php

use App\Http\Controllers\JobCard\JobCardChargesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/job-card-charges')
        ->name('dashboard.job-card-charges.')
        ->group(function () {
            
            // Create a new job card charge
            Route::post('/{jobcard_id}/store', [JobCardChargesController::class, 'store'])
                ->name('store');
            
            // Update an existing job card charge
            Route::put('/{id}/update', [JobCardChargesController::class, 'update'])
                ->name('update');
            
            // Delete a job card charge
            Route::delete('/{id}/destroy', [JobCardChargesController::class, 'destroy'])
                ->name('destroy');
            
        });
});