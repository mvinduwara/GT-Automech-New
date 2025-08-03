<?php

use App\Http\Controllers\Vehicle\VehicleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_cashier'])->group(function () {
    Route::prefix('dashboard/vehicle')
        ->name('dashboard.vehicle.')
        ->group(function () {
            Route::get('/', [VehicleController::class, 'index'])->name('index');
            Route::get('/create', [VehicleController::class, 'create'])->name('create');
            Route::post('/', [VehicleController::class, 'store'])->name('store');
            Route::get('/{vehicle}/edit', [VehicleController::class, 'edit'])->name('edit');
            Route::put('/{vehicle}', [VehicleController::class, 'update'])->name('update'); 
            Route::delete('/{vehicle}', [VehicleController::class, 'destroy'])->name('destroy'); 
        });
});

