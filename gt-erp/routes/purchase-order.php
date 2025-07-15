<?php

use App\Http\Controllers\PurchaseOrder\AdminPurchaseOrderController;
use App\Http\Controllers\PurchaseOrder\CashierPurchaseOrderController;
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

Route::middleware(['auth', 'is_cashier'])->group(function () {
    Route::prefix('dashboard/purchase-order/cashier')
        ->name('dashboard.purchase-order.cashier.')
        ->group(function () {
            Route::get('/', [CashierPurchaseOrderController::class, 'index'])->name('index');
            Route::get('/create', [CashierPurchaseOrderController::class, 'create'])->name('create');
            Route::get('/{purchase_order_id}/edit', [CashierPurchaseOrderController::class, 'edit'])->name('edit');
        });
});
