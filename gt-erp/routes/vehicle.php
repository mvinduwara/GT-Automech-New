<?php

use App\Http\Controllers\Vehicle\VehicleController;
use App\Http\Controllers\Vehicle\VehicleBrandController;
use App\Http\Controllers\Vehicle\VehicleModelController;
use Illuminate\Support\Facades\Route;

Route::get('/api/vehicles/search', [VehicleController::class, 'search'])->name('api.vehicles.search');

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
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

    Route::post('/dashboard/vehicle-brand/store', [VehicleBrandController::class, 'store'])
        ->name('dashboard.vehicle-brand.store');

    Route::post('/dashboard/vehicle-model/store', [VehicleModelController::class, 'store'])
        ->name('dashboard.vehicle-model.store');
});
