<?php

use App\Http\Controllers\Vehicle\VehicleController;
use App\Http\Controllers\Vehicle\VehicleBrandController;
use App\Http\Controllers\Vehicle\VehicleModelController;
use Illuminate\Support\Facades\Route;

Route::get('/api/vehicles/search', [VehicleController::class, 'search'])->name('api.vehicles.search');
Route::get('/api/vehicle-models/search', [VehicleModelController::class, 'search'])->name('api.vehicle-models.search');

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {

    /**
     * VEHICLE ROUTES
     */
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


    /**
     * VEHICLE BRANDS ROUTES
     */
    Route::prefix('dashboard/vehicle-brands')
        ->name('dashboard.vehicle-brands.')
        ->group(function () {
            Route::get('/', [VehicleBrandController::class, 'index'])->name('index');
            Route::post('/', [VehicleBrandController::class, 'store'])->name('store');
            Route::put('/{vehicleBrand}', [VehicleBrandController::class, 'update'])->name('update');
            Route::delete('/{vehicleBrand}', [VehicleBrandController::class, 'destroy'])->name('destroy');
        });


    /**
     * VEHICLE MODELS ROUTES
     */
    Route::prefix('dashboard/vehicle-models')
        ->name('dashboard.vehicle-models.')
        ->group(function () {
            Route::get('/', [VehicleModelController::class, 'index'])->name('index');
            Route::post('/', [VehicleModelController::class, 'store'])->name('store');
            Route::put('/{vehicleModel}', [VehicleModelController::class, 'update'])->name('update');
            Route::delete('/{vehicleModel}', [VehicleModelController::class, 'destroy'])->name('destroy');
        });
});
