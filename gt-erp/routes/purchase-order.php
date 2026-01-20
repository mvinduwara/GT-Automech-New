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
            Route::put('/{purchaseOrder_id}/update/requested', [AdminPurchaseOrderController::class, 'requested'])->name('item.update.requested');
        });
});

Route::middleware(['auth', 'is_admin_or_cashier'])->group(function () {
    Route::prefix('dashboard/purchase-order')
        ->name('dashboard.purchase-order.')
        ->group(function () {
            Route::get('/create', [PurchaseOrderController::class, 'create'])->name('create');
            Route::post('/store', [PurchaseOrderController::class, 'store'])->name('store');
            Route::get('/{purchase_order_id}/edit', [PurchaseOrderController::class, 'edit'])->name('edit');
            Route::put('/{purchase_order_id}', [PurchaseOrderController::class, 'update'])->name('update');

            // Search Routes
            Route::get('/products/search', [PurchaseOrderController::class, 'searchProducts'])->name('products.search');
            Route::get('/suppliers/search', [PurchaseOrderController::class, 'searchSuppliers'])->name('suppliers.search');
        });
});
