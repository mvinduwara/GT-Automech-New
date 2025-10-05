<?php

use App\Http\Controllers\Invoice\InvoiceController;
use App\Http\Controllers\JobCard\JobCardController;
use App\Http\Controllers\JobCard\OpenJobCardController;
use App\Http\Controllers\JobCard\SelectionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/job-card')
        ->name('dashboard.job-card.')
        ->group(function () {

            Route::get('/', [JobCardController::class, 'index'])->name('index');
            Route::get('/open', [OpenJobCardController::class, 'index'])->name('open');

            // Route::get('/invoice', [OpenJobCardController::class, 'invoice'])->name('invoice');
            // Route::get('/create', [JobCardController::class, 'create'])->name('create');
            Route::post('/store', [JobCardController::class, 'store'])->name('store');
            Route::get('/{jobcard_id}/form', [JobCardController::class, 'form'])->name('form');
           
           
            Route::post('/service-job-card/store', [JobCardController::class, 'jobCardStore'])->name('jobCardStore');
           
           
            Route::get('/{jobcard_id}/edit', [JobCardController::class, 'edit'])->name('edit');
            Route::put('/{jobcard_id}/remarks', [JobCardController::class, 'updateRemarks'])->name('remarks');
            Route::put('/{jobcard_id}/status', [JobCardController::class, 'updateStatus'])->name('status');
            Route::put('/{stock_id}/update', [JobCardController::class, 'update'])->name('update');
            Route::get('/{jobcard_id}/view', [JobCardController::class, 'view'])->name('job-card.view');

            Route::prefix('selections')->name('selections.')->group(function () {
                Route::get('/oil-brands', [SelectionController::class, 'oilBrands'])->name('oilBrands');
                Route::get('/oils',        [SelectionController::class, 'oils'])->name('oils');
                Route::get('/oil-filters', [SelectionController::class, 'oilFilters'])->name('oilFilters');
                Route::get('/drain-plug-seals', [SelectionController::class, 'drainPlugSeals'])->name('drainPlugSeals');

                Route::get('/vehicle-services', [SelectionController::class, 'vehicleServices']);
                Route::get('/vehicle-service-options', [SelectionController::class, 'vehicleServiceOptions']);
            });

            Route::get('/{jobcard_id}/invoice', [InvoiceController::class, 'viewInvoice'])->name('invoice');

            Route::post('/services/store', [JobCardController::class, 'storeServices']);
            // Route::post('/store-invoice', [JobCardController::class, 'store'])->name('job-card.store-invoice');
            Route::patch('/invoice/{invoice}/discounts', [JobCardController::class, 'updateDiscounts'])->name('invoice.update-discounts');
            Route::get('/invoice/{invoice}', [JobCardController::class, 'show'])->name('job-card.invoice');
            Route::post('/invoice/store', [InvoiceController::class, 'storeInvoice']);

        });
});
