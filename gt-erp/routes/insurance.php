<?php

use App\Http\Controllers\Insurance\InsuranceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('dashboard')->name('dashboard.')->group(function () {
    
    Route::prefix('insurance')->name('insurance.')->group(function () {
        Route::post('/job-card/{jobCard}', [InsuranceController::class, 'store'])
            ->name('store');
        Route::get('/{insurance}', [InsuranceController::class, 'show'])
            ->name('show');
        Route::patch('/{insurance}', [InsuranceController::class, 'update'])
            ->name('update');
    });
    
});