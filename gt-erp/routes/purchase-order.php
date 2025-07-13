<?php

use App\Http\Controllers\PurchaseOrder\AdminPurchaseOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/purchase-order')
        ->name('dashboard.purchase-order.')
        ->group(function () {

            Route::get('/', [AdminPurchaseOrderController::class, 'index'])->name('index');
            Route::get('/{purchaseOrder_id}/view', [AdminPurchaseOrderController::class, 'view'])->name('view');
            // Route::put('/{purchaseOrder_id}/update', [AdminPurchaseOrderController::class, 'update'])->name('update');
        });
});
