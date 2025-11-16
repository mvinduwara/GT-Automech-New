<?php

use App\Http\Controllers\JobCard\JobCardVehicleServiceController;
use App\Http\Controllers\Vehicle\VehicleServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard')
        ->name('dashboard.')
        ->group(function () {

            Route::get('/vehicle-services', [VehicleServiceController::class, 'index'])->name("vehicle-services.index");
            Route::post('/vehicle-services/create', [VehicleServiceController::class, 'create'])->name("vehicle-services.create");
            Route::post('/vehicle-services/{vehicleService_id}/update', [VehicleServiceController::class, 'update'])->name("vehicle-services.update");
            Route::get('/vehicle-services/{vehicleService_id}', [VehicleServiceController::class, 'serviceIndex'])->name("vehicle-services.service.index");
            Route::post('/vehicle-services/{vehicleService_id}/add', [VehicleServiceController::class, 'optionStore'])->name("vehicle-services.option.store");
            Route::post('/vehicle-services/{vehicleService_id}/{vehicleServiceOption_id}/update', [VehicleServiceController::class, 'optionUpdate'])->name("vehicle-services.option.update");

            Route::post('/job-card-vehicle-services', [JobCardVehicleServiceController::class, 'store']);
            Route::put('/job-card-vehicle-services/{jobCardVehicleService_id}', [JobCardVehicleServiceController::class, 'update']);
            Route::post('/job-card-vehicle-services/{jobCardVehicleService_id}/process', [JobCardVehicleServiceController::class, 'process']);
        });
});
