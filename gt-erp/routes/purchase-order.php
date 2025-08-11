<?php

use App\Http\Controllers\PurchaseOrder\AdminPurchaseOrderController;
use App\Http\Controllers\PurchaseOrder\CashierPurchaseOrderController;
use App\Http\Controllers\PurchaseOrder\PurchaseOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::prefix('dashboard/purchase-order')
        ->name('dashboard.purchase-order.')
        ->group(function () {
            Route::get('/', [PurchaseOrderController::class, 'index'])->name('index');
        });
});

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/purchase-order')
        ->name('dashboard.purchase-order.')
        ->group(function () {
            Route::get('/{purchaseOrder_id}/view', [AdminPurchaseOrderController::class, 'view'])->name('view');
            Route::put('/{purchaseOrder_id}/update', [AdminPurchaseOrderController::class, 'update'])->name('item.update');
        });
});

Route::middleware(['auth', 'is_cashier'])->group(function () {
    Route::prefix('dashboard/purchase-order')
        ->name('dashboard.purchase-order.')
        ->group(function () {
           Route::get('/create', [CashierPurchaseOrderController::class, 'create'])->name('create');
            Route::post('/store', [CashierPurchaseOrderController::class, 'store'])->name('store');
            Route::get('/{purchase_order_id}/edit', [CashierPurchaseOrderController::class, 'edit'])->name('edit');
            Route::put('/{purchase_order_id}', [CashierPurchaseOrderController::class, 'update'])->name('update');
        });
});
