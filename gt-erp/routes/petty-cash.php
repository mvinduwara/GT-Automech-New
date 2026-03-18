<?php

use App\Http\Controllers\PettyCash\PettyCashController;
use App\Http\Controllers\PettyCash\PettyCashItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->group(function () {
            Route::get('/', [PettyCashController::class, 'index'])->name('index');

            // Add the item update route here (accessible to all authenticated users)
            Route::patch('/items/{item}/update-checked', [PettyCashItemController::class, 'updateCheckedStatus'])
                ->name('item.update-checked');

            // Fixed paths should come before wildcards
            Route::get('/create', [PettyCashController::class, 'create'])->middleware('is_admin_or_cashier')->name('create');

            // Admin routes for approve/reject (role check in controller)
            Route::patch('/{voucher_number}/approve', [PettyCashController::class, 'approve'])->name('approve');
            Route::patch('/{voucher_number}/reject', [PettyCashController::class, 'reject'])->name('reject');

            // Service manager routes for status changes (role check in controller)
            Route::patch('/{voucher_number}/set-pending', [PettyCashController::class, 'setPending'])->name('set-pending');
            Route::patch('/{voucher_number}/set-paid', [PettyCashController::class, 'setPaid'])->name('set-paid');

            // View and Download
            Route::get('/{voucher_number}', [PettyCashController::class, 'show'])->name('show');
            Route::get('/{voucher_number}/download-pdf', [PettyCashController::class, 'downloadPdf'])->name('download-pdf');

            // Submit for Review (recorded after spend)
            Route::post('/{voucher_number}/submit-for-review', [PettyCashController::class, 'submitForReview'])->name('submit-for-review');

            // Replenish (Imprest System)
            Route::post('/replenish', [PettyCashController::class, 'replenish'])->name('replenish');

            // Finalize (Admin only, checked in controller)
            Route::post('/{voucher_number}/finalize', [PettyCashController::class, 'finalize'])->name('finalize');
        });
});

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->group(function () {
            Route::get('/{voucher_number}/edit', [PettyCashController::class, 'edit'])->name('edit');
            Route::post('/', [PettyCashController::class, 'store'])->name('store');
            Route::put('/{voucher_number}', [PettyCashController::class, 'update'])->name('update');
            Route::delete('/{voucher_number}', [PettyCashController::class, 'destroy'])->name('destroy');
        });
});