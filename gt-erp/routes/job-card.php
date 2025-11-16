<?php

use App\Http\Controllers\JobCard\JobCardController;
use App\Http\Controllers\JobCard\JobCardEmployeeController;
use App\Http\Controllers\JobCard\JobCardProductsController;
use App\Http\Controllers\JobCard\JobCardServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/job-card')
        ->name('dashboard.job-card.')
        ->group(function () {

            // List and create routes
            Route::get('/', [JobCardController::class, 'index'])->name('index');
            Route::get('/open', [JobCardController::class, 'open'])->name('open');
            Route::post('/store', [JobCardController::class, 'store'])->name('store');

            // Form route
            Route::get('/{jobcard_id}/form', [JobCardController::class, 'form'])->name('form');

            // Update routes
            Route::put('/{jobcard_id}/customer', [JobCardController::class, 'updateCustomer'])->name('customer');
            Route::put('/{jobcard_id}/vehicle', [JobCardController::class, 'updateVehicle'])->name('vehicle');
            Route::put('/{jobcard_id}/mileage', [JobCardController::class, 'updateMileage'])->name('mileage');
            Route::put('/{jobcard_id}/remarks', [JobCardController::class, 'updateRemarks'])->name('remarks');
            Route::put('/{jobcard_id}/status', [JobCardController::class, 'updateStatus'])->name('status');

            Route::get('/{jobCard}/services/edit', [JobCardServiceController::class, 'edit'])
                ->name('services.edit');

            Route::put('/{jobCard}/type', [JobCardController::class, 'updateType'])
                ->name('type');

            Route::post('/{jobCard}/services', [JobCardServiceController::class, 'store'])
                ->name('services.store');

            Route::delete('/{jobCard}/services/{service}', [JobCardServiceController::class, 'destroy'])
                ->name('services.destroy');

            Route::patch('/{jobCard}/services/{service}/toggle', [JobCardServiceController::class, 'toggleInclusion'])
                ->name('services.toggle');

            Route::get('/products/search', [JobCardProductsController::class, 'search'])
                ->name('products.search');
            Route::post('/{jobCard}/products', [JobCardProductsController::class, 'store'])
                ->name('products.store');
            Route::delete('/{jobCard}/products/{product}', [JobCardProductsController::class, 'destroy'])
                ->name('products.destroy');

            Route::put('{jobCard}/assign-employees', [JobCardEmployeeController::class, 'assignEmployees'])
                ->name('assign-employees');

            Route::get('/{jobCard}/print', [JobCardController::class, 'print'])->name('print');
            Route::get('{jobCard}', [JobCardEmployeeController::class, 'show'])
                ->name('show');
        });
});
