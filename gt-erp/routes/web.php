<?php

use App\Http\Controllers\GRN\GrnController;
use App\Http\Controllers\Invoice\InvoiceController;
use App\Http\Controllers\JobCard\JobCardController;
use App\Http\Controllers\PettyCash\PettyCashController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('products', function () {
        return Inertia::render('products');
    })->name('products');
    Route::get('users', function () {
        return Inertia::render('users');
    })->name('users');

    Route::prefix('dashboard/job-card')
        ->name('dashboard.job-card.')
        ->middleware(['auth', 'is_admin'])
        ->group(function () {
            Route::get('/', [JobCardController::class, 'index'])->name('index');
            Route::get('/create', [JobCardController::class, 'create'])->name('create');
            Route::get('/{job_card_id}/edit', [JobCardController::class, 'edit'])->name('edit');
        });

    Route::prefix('dashboard/petty-cash')
        ->name('dashboard.petty-cash.')
        ->middleware(['auth', 'is_admin'])
        ->group(function () {
            Route::get('/', [PettyCashController::class, 'index'])->name('index');
            Route::get('/create', [PettyCashController::class, 'create'])->name('create');
            Route::get('/{job_card_id}/edit', [PettyCashController::class, 'edit'])->name('edit');
        });
    Route::prefix('dashboard/grn')
        ->name('dashboard.grn.')
        ->middleware(['auth', 'is_admin'])
        ->group(function () {
            Route::get('/', [GrnController::class, 'index'])->name('index');
            Route::get('/create', [GrnController::class, 'create'])->name('create');
            Route::get('/{job_card_id}/edit', [GrnController::class, 'edit'])->name('edit');
        });

    Route::prefix('dashboard/invoice')
        ->name('dashboard.invoice.')
        ->middleware(['auth', 'is_admin'])
        ->group(function () {
            Route::get('/', [InvoiceController::class, 'index'])->name('index');
            Route::get('/create', [InvoiceController::class, 'create'])->name('create');
            Route::get('/{job_card_id}/edit', [InvoiceController::class, 'edit'])->name('edit');
        });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/stock.php';
require __DIR__ . '/purchase-order.php';
require __DIR__ . '/customer.php';
